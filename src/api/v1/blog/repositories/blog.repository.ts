import mongoose, { SortOrder, Types } from "mongoose";
import Blog from "../models/blog.model";
import { IBlogRepository } from "./blog.repository.interface";
import {
    IBlogPostEntity,
    IBlogPostStatus,
} from "../models/blog.entity";
import { IQueryParams, PaginatedData } from "../../common/models/common.dto";
import logger from "../../../../app/utils/logger";
import { ICreateBlogDto, IUpdateBlogDto } from "../models/blog.dto";

export class BlogRepository implements IBlogRepository {

    /* -------------------------------------------------------------------------- */
    /*                               NORMALIZER                                   */
    /* -------------------------------------------------------------------------- */
    private normalize(blog: any): IBlogPostEntity {
        return {
            id: blog._id.toString(),
            title: blog.title,
            slug: blog.slug,
            content: blog.content,
            excerpt: blog.excerpt ?? null,
            author: blog.author.toString(),
            category: blog.category.toString(),
            tags: blog.tags ?? [],
            featuredImage: blog.featuredImage ?? null,
            status: blog.status,
            visibility: blog.visibility,
            viewCount: blog.viewCount ?? 0,
            likes:
                blog.likes?.map((l: any) => ({
                    user: l.user.toString(),
                    likedAt: l.likedAt,
                })) ?? [],
            readTime: blog.readTime ?? 0,
            seo: blog.seo ?? null,
            publishedAt: blog.publishedAt ?? null,
            scheduledFor: blog.scheduledFor ?? null,
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt,
        };
    }

    /* -------------------------------------------------------------------------- */
    /*                                   CREATE                                   */
    /* -------------------------------------------------------------------------- */
    async create(data: ICreateBlogDto): Promise<IBlogPostEntity | null> {
        try {
            const blog = await Blog.create(data);
            return this.normalize(blog);
        } catch (error) {
            logger.error("Error creating blog post: %o", error);
            return null;
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                 FIND ALL                                   */
    /* -------------------------------------------------------------------------- */
    async findAll(
        params: IQueryParams
    ): Promise<PaginatedData<IBlogPostEntity>> {
        try {
            const {
                page = 1,
                limit = 10,
                search = "",
                sortBy = "createdAt",
                sortOrder = "desc",
            } = params;

            const skip = (page - 1) * limit;

            const filter: any = {};

            if (search.trim()) {
                filter.$text = { $search: search };
            }

            const sort: Record<string, SortOrder> = {
                [sortBy]: sortOrder === "asc" ? 1 : -1,
            };

            const [blogs, total] = await Promise.all([
                Blog.find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Blog.countDocuments(filter),
            ]);

            return {
                data: blogs.map(this.normalize),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            logger.error("Error fetching blogs: %o", error);
            return {
                data: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                },
            };
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                FIND BY ID                                  */
    /* -------------------------------------------------------------------------- */
    async findById(id: string): Promise<IBlogPostEntity | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) return null;

            const blog = await Blog.findById(id).lean();
            return blog ? this.normalize(blog) : null;
        } catch (error) {
            logger.error("Error finding blog by id %s: %o", id, error);
            return null;
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                               FIND BY SLUG                                 */
    /* -------------------------------------------------------------------------- */
    async findBySlug(slug: string): Promise<IBlogPostEntity | null> {
        try {
            const blog = await Blog.findOne({ slug }).lean();
            return blog ? this.normalize(blog) : null;
        } catch (error) {
            logger.error("Error finding blog by slug %s: %o", slug, error);
            return null;
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                   UPDATE                                   */
    /* -------------------------------------------------------------------------- */
    async updateById(
        id: string,
        updates: IUpdateBlogDto
    ): Promise<IBlogPostEntity | null> {
        try {
            const updated = await Blog.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true }
            ).lean();

            return updated ? this.normalize(updated) : null;
        } catch (error) {
            logger.error("Error updating blog %s: %o", id, error);
            return null;
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                   DELETE                                   */
    /* -------------------------------------------------------------------------- */
    async deleteById(id: string): Promise<boolean> {
        try {
            const deleted = await Blog.findByIdAndDelete(id);
            return !!deleted;
        } catch (error) {
            logger.error("Error deleting blog %s: %o", id, error);
            return false;
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                              VIEW COUNT                                    */
    /* -------------------------------------------------------------------------- */
    async incrementViewCount(id: string): Promise<boolean | null> {
        try {
            const result = await Blog.findByIdAndUpdate(
                id,
                { $inc: { viewCount: 1 } }
            );

            if (!result) return null; // not found
            return true; // success
        } catch (error) {
            logger.error(
                "Error incrementing view count for %s: %o",
                id,
                error
            );
            return false; // DB error
        }
    }


    /* -------------------------------------------------------------------------- */
    /*                                   LIKES                                    */
    /* -------------------------------------------------------------------------- */
    async addLike(postId: string, userId: string): Promise<boolean | null> {
        try {
            const postObjectId = new Types.ObjectId(postId);
            const userObjectId = new Types.ObjectId(userId);

            const result = await Blog.updateOne(
                {
                    _id: postObjectId,
                    likes: { $not: { $elemMatch: { user: userObjectId } } }
                },
                {
                    $push: {
                        likes: { user: userObjectId, likedAt: new Date() }
                    }
                }
            );

            if (result.matchedCount === 0 || result.modifiedCount === 0) {
                return null; // already liked
            }

            return true;
        } catch (error) {
            logger.error("Error adding like to %s: %o", postId, error);
            return false;
        }
    }

    async removeLike(postId: string, userId: string): Promise<boolean | null> {
        try {
            const postObjectId = new Types.ObjectId(postId);
            const userObjectId = new Types.ObjectId(userId);

            const result = await Blog.updateOne(
                { _id: postObjectId, "likes.user": userObjectId },
                { $pull: { likes: { user: userObjectId } } }
            );

            // Not found OR like not present
            if (result.matchedCount === 0 || result.modifiedCount === 0) {
                return null; // already unlike
            }

            return true;
        } catch (error) {
            logger.error("Error removing like from %s: %o", postId, error);
            return false;
        }
    }



    /* -------------------------------------------------------------------------- */
    /*                                SCHEDULE                                    */
    /* -------------------------------------------------------------------------- */
    async schedule(
        postId: string,
        publishDate: Date
    ): Promise<IBlogPostEntity | null> {
        return this.updateById(postId, {
            scheduledFor: publishDate,
            status: IBlogPostStatus.SCHEDULED,
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                                 PUBLISH                                    */
    /* -------------------------------------------------------------------------- */
    async publish(postId: string): Promise<IBlogPostEntity | null> {
        return this.updateById(postId, {
            status: IBlogPostStatus.PUBLISHED,
            publishedAt: new Date(),
            scheduledFor: new Date(),
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                                 ARCHIVE                                    */
    /* -------------------------------------------------------------------------- */
    async archive(postId: string): Promise<IBlogPostEntity | null> {
        return this.updateById(postId, {
            status: IBlogPostStatus.ARCHIVED,
        });
    }
}

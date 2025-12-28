import slugify from "slugify";
import { ApiError } from "../../common/utils/apiError";
import { ErrorCode } from "../../common/constants/errorCodes";
import { IQueryParams, PaginatedData } from "../../common/models/common.dto";
import { ICreateBlogDto, IUpdateBlogDto } from "../models/blog.dto";
import {
    IBlogPostEntity,
    IBlogPostStatus,
    IBlogPostVisibility,
} from "../models/blog.entity";
import { IBlogRepository } from "../repositories/blog.repository.interface";
import { IBlogService } from "./blog.service.interface";

export class BlogService implements IBlogService {
    constructor(
        private readonly blogRepository: IBlogRepository
    ) { }

    /* -------------------------------------------------------------------------- */
    /*                                   CREATE                                   */
    /* -------------------------------------------------------------------------- */
    async create(post: ICreateBlogDto): Promise<IBlogPostEntity> {
        if (!post.title || !post.content) {
            throw new ApiError(
                "Title and content are required",
                400,
                ErrorCode.BAD_REQUEST
            );
        }

        const slug =
            post.slug ??
            slugify(post.title, { lower: true, strict: true });

        const payload: Partial<IBlogPostEntity> = {
            ...post,
            slug,
            status: post.status ?? IBlogPostStatus.DRAFT,
            visibility: post.visibility ?? IBlogPostVisibility.PUBLIC,
        };

        const created = await this.blogRepository.create(payload);
        if (!created) {
            throw new ApiError(
                "Failed to create blog post",
                500,
                ErrorCode.INTERNAL_SERVER_ERROR
            );
        }

        return created;
    }

    /* -------------------------------------------------------------------------- */
    /*                                  GET BY ID                                 */
    /* -------------------------------------------------------------------------- */
    async getById(
        id: string,
        includeDrafts = false
    ): Promise<IBlogPostEntity> {
        const blog = await this.blogRepository.findById(id);

        if (!blog) {
            throw new ApiError(
                "Blog post not found",
                404,
                ErrorCode.NOT_FOUND
            );
        }

        if (
            !includeDrafts &&
            blog.status === IBlogPostStatus.DRAFT
        ) {
            throw new ApiError(
                "Blog post is not published",
                403,
                ErrorCode.FORBIDDEN
            );
        }

        return blog;
    }

    /* -------------------------------------------------------------------------- */
    /*                                GET BY SLUG                                 */
    /* -------------------------------------------------------------------------- */
    async getBySlug(
        slug: string,
        includeDrafts = false
    ): Promise<IBlogPostEntity> {
        const blog = await this.blogRepository.findBySlug(slug);

        if (!blog) {
            throw new ApiError(
                "Blog post not found",
                404,
                ErrorCode.NOT_FOUND
            );
        }

        if (
            !includeDrafts &&
            blog.status === IBlogPostStatus.DRAFT
        ) {
            throw new ApiError(
                "Blog post is not published",
                403,
                ErrorCode.FORBIDDEN
            );
        }

        return blog;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   GET ALL                                  */
    /* -------------------------------------------------------------------------- */
    async getAll(
        query: IQueryParams
    ): Promise<PaginatedData<IBlogPostEntity>> {
        const result = await this.blogRepository.findAll(query);

        if (!result?.data) {
            throw new ApiError(
                "No blog posts found",
                404,
                ErrorCode.NOT_FOUND
            );
        }

        return result;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   UPDATE                                   */
    /* -------------------------------------------------------------------------- */
    async update(
        id: string,
        updateData: IUpdateBlogDto
    ): Promise<IBlogPostEntity> {
        if (!id) {
            throw new ApiError(
                "Blog ID is required",
                400,
                ErrorCode.BAD_REQUEST
            );
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            throw new ApiError(
                "No update data provided",
                400,
                ErrorCode.BAD_REQUEST
            );
        }

        const existing = await this.blogRepository.findById(id);
        if (!existing) {
            throw new ApiError(
                "Blog post not found",
                404,
                ErrorCode.NOT_FOUND
            );
        }

        const updated = await this.blogRepository.updateById(id, updateData);
        if (!updated) {
            throw new ApiError(
                "Failed to update blog post",
                500,
                ErrorCode.INTERNAL_SERVER_ERROR
            );
        }

        return updated;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   DELETE                                   */
    /* -------------------------------------------------------------------------- */
    async delete(id: string): Promise<boolean> {
        const deleted = await this.blogRepository.deleteById(id);
        if (!deleted) {
            throw new ApiError(
                "Blog post not found",
                404,
                ErrorCode.NOT_FOUND
            );
        }
        return true;
    }

    /* -------------------------------------------------------------------------- */
    /*                              VIEW COUNT                                    */
    /* -------------------------------------------------------------------------- */
    async incrementViewCount(id: string): Promise<boolean> {
        const result = await this.blogRepository.incrementViewCount(id);
        if (result === null) throw new ApiError("Blog post not found", 404, ErrorCode.NOT_FOUND);
        if (result === false) throw new ApiError("Failed to increment view count", 500, ErrorCode.INTERNAL_SERVER_ERROR);
        return true;
    }


    /* -------------------------------------------------------------------------- */
    /*                                   LIKES                                    */
    /* -------------------------------------------------------------------------- */
    async addLike(postId: string, userId: string): Promise<boolean> {
        const post = await this.blogRepository.findById(postId);
        if (!post) {
            throw new ApiError(
                "Blog post not found",
                404,
                ErrorCode.NOT_FOUND
            );
        }

        const success = await this.blogRepository.addLike(postId, userId);
        if (!success) {
            throw new ApiError(
                "Blog already liked",
                409,
                ErrorCode.CONFLICT
            );
        }

        return true;
    }

    async removeLike(postId: string, userId: string): Promise<boolean> {
        const post = await this.blogRepository.findById(postId);
        if (!post) {
            throw new ApiError(
                "Blog post not found",
                404,
                ErrorCode.NOT_FOUND
            );
        }

        const success = await this.blogRepository.removeLike(postId, userId);
        if (!success) {
            throw new ApiError(
                "Like not found",
                409,
                ErrorCode.CONFLICT
            );
        }

        return true;
    }


    /* -------------------------------------------------------------------------- */
    /*                                 SCHEDULE                                   */
    /* -------------------------------------------------------------------------- */
    async schedule(
        postId: string,
        publishDate: Date
    ): Promise<IBlogPostEntity> {
        if (publishDate <= new Date()) {
            throw new ApiError(
                "Publish date must be in the future",
                400,
                ErrorCode.BAD_REQUEST
            );
        }

        const post = await this.blogRepository.findById(postId);
        if (!post) {
            throw new ApiError(
                "Blog post not found",
                404,
                ErrorCode.NOT_FOUND
            );
        }

        const scheduled = await this.blogRepository.schedule(
            postId,
            publishDate
        );

        if (!scheduled) {
            throw new ApiError(
                "Failed to schedule blog post",
                500,
                ErrorCode.INTERNAL_SERVER_ERROR
            );
        }

        return scheduled;
    }

    /* -------------------------------------------------------------------------- */
    /*                                  PUBLISH                                   */
    /* -------------------------------------------------------------------------- */
    async publish(postId: string): Promise<IBlogPostEntity> {
        const post = await this.blogRepository.findById(postId);
        if (!post) {
            throw new ApiError(
                "Blog post not found",
                404,
                ErrorCode.NOT_FOUND
            );
        }

        if (post.status === IBlogPostStatus.PUBLISHED) {
            throw new ApiError(
                "Blog post already published",
                409,
                ErrorCode.CONFLICT
            );
        }

        const published = await this.blogRepository.publish(postId);
        if (!published) {
            throw new ApiError(
                "Failed to publish blog post",
                500,
                ErrorCode.INTERNAL_SERVER_ERROR
            );
        }

        return published;
    }

    /* -------------------------------------------------------------------------- */
    /*                                  ARCHIVE                                   */
    /* -------------------------------------------------------------------------- */
    async archive(postId: string): Promise<IBlogPostEntity> {
        const post = await this.blogRepository.findById(postId);
        if (!post) {
            throw new ApiError(
                "Blog post not found",
                404,
                ErrorCode.NOT_FOUND
            );
        }

        const archived = await this.blogRepository.archive(postId);
        if (!archived) {
            throw new ApiError(
                "Failed to archive blog post",
                500,
                ErrorCode.INTERNAL_SERVER_ERROR
            );
        }

        return archived;
    }
}

import { IBlogPostEntity } from "../models/blog.entity";
import { IQueryParams, PaginatedData } from "../../common/models/common.dto";
import { IUpdateBlogDto } from "../models/blog.dto";

/**
 * Repository interface for blog-related database operations.
 */
export interface IBlogRepository {
    /**
     * Create a new blog post
     * @param data Partial blog post data
     */
    create(data: Partial<IBlogPostEntity>): Promise<IBlogPostEntity | null>;

    /**
     * Find a blog post by its ID
     * @param id Blog post ID
     */
    findById(id: string): Promise<IBlogPostEntity | null>;

    /**
     * Find a blog post by its slug
     * @param slug Blog post slug
     */
    findBySlug(slug: string): Promise<IBlogPostEntity | null>;

    /**
     * Find multiple blog posts with pagination and optional filters
     * @param params Query parameters (page, limit, search, sort, filters)
     */
    findAll(params: IQueryParams): Promise<PaginatedData<IBlogPostEntity>>;

    /**
     * Update a blog post by ID
     * @param id Blog post ID
     * @param data Partial blog post data
     */
    updateById(id: string, data: IUpdateBlogDto): Promise<IBlogPostEntity | null>;

    /**
     * Delete a blog post by ID
     * @param id Blog post ID
     */
    deleteById(id: string): Promise<boolean>;

    /**
     * Increment the view count for a blog post
     * @param id Blog post ID
     */
    incrementViewCount(id: string): Promise<boolean | null>;

    /**
     * Add a like from a user
     * @param postId Blog post ID
     * @param userId User ID
     */
    addLike(postId: string, userId: string): Promise<boolean | null>;

    /**
     * Remove a like from a user
     * @param postId Blog post ID
     * @param userId User ID
     */
    removeLike(postId: string, userId: string): Promise<boolean | null>;

    /**
     * Schedule a blog post for future publishing
     * @param postId Blog post ID
     * @param publishDate Date to schedule
     */
    schedule(postId: string, publishDate: Date): Promise<IBlogPostEntity | null>;

    /**
     * Publish a blog post immediately
     * @param postId Blog post ID
     */
    publish(postId: string): Promise<IBlogPostEntity | null>;

    /**
     * Archive a blog post
     * @param postId Blog post ID
     */
    archive(postId: string): Promise<IBlogPostEntity | null>;
}

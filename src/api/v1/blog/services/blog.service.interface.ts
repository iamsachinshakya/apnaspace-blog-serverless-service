import { IQueryParams, PaginatedData } from "../../common/models/common.dto";
import { ICreateBlogDto, IUpdateBlogDto } from "../models/blog.dto";
import { IBlogPostEntity } from "../models/blog.entity";

export interface IBlogService {
    /**
     * Create a new blog post
     * @param post - Blog data
     * @returns Created blog post entity
     */
    create(post: Partial<ICreateBlogDto>): Promise<IBlogPostEntity>;

    /**
     * Get a single blog post by ID
     * @param id - Blog ID
     * @param includeDrafts - Whether to include draft posts
     */
    getById(id: string, includeDrafts?: boolean): Promise<IBlogPostEntity>;


    /**
     * Get a single blog post by slug
     * @param slug - Blog slug
     * @param includeDrafts - Whether to include draft posts
     */
    getBySlug(slug: string, includeDrafts?: boolean): Promise<IBlogPostEntity>;

    /**
     * Get multiple blog posts with optional filters
     * @param filters - Filter by status, category, author, tags, visibility, date, etc.
     * @param skip - Pagination skip
     * @param limit - Pagination limit
     */
    getAll(query: IQueryParams): Promise<PaginatedData<IBlogPostEntity>>;

    /**
     * Update a blog post by ID
     * @param id - Blog post ID
     * @param updateData - Partial blog post data to update
     */
    update(id: string, updateData: IUpdateBlogDto): Promise<IBlogPostEntity>;

    /**
     * Delete a blog post by ID
     * @param id - Blog post ID
     */
    delete(id: string): Promise<boolean>;

    /**
     * Increment view count
     * @param id - Blog post ID
     */
    incrementViewCount(id: string): Promise<boolean>;

    /**
     * Add a like to a blog post
     * @param postId - Blog post ID
     * @param userId - User ID
     */
    addLike(postId: string, userId: string): Promise<boolean>;

    /**
     * Remove a like from a blog post
     * @param postId - Blog post ID
     * @param userId - User ID
     */
    removeLike(postId: string, userId: string): Promise<boolean>;

    /**
     * Schedule a blog post to be published at a future date
     * @param postId - Blog post ID
     * @param publishDate - Date to publish
     */
    schedule(postId: string, publishDate: Date): Promise<IBlogPostEntity>;

    /**
     * Publish a draft or scheduled blog post immediately
     * @param postId - Blog post ID
     */
    publish(postId: string): Promise<IBlogPostEntity>;

    /**
     * Archive a blog post
     * @param postId - Blog post ID
     */
    archive(postId: string): Promise<IBlogPostEntity>;
}

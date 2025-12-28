import { Request, Response } from "express";
import { IBlogController } from "./blog.controller.interface";
import { IBlogService } from "../services/blog.service.interface";
import { ICreateBlogDto, IUpdateBlogDto } from "../models/blog.dto";
import { IAuthUser } from "../../auth/models/auth.dto";
import { ApiError } from "../../common/utils/apiError";
import { ErrorCode } from "../../common/constants/errorCodes";
import { ApiResponse } from "../../common/utils/apiResponse";
import { IQueryParams } from "../../common/models/common.dto";
import { PAGINATION_PAGE_LIMIT } from "../../common/constants/constants";

export class BlogController implements IBlogController {
    constructor(private readonly blogService: IBlogService) { }

    async create(req: Request, res: Response): Promise<Response> {
        const authUser = req.user as IAuthUser;
        const data: ICreateBlogDto = req.body;

        if (!authUser) throw new ApiError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
        if (!data) throw new ApiError("Request body is required", 400, ErrorCode.BAD_REQUEST);

        const blog = await this.blogService.create({
            ...data,
            author: authUser.id,
        });

        return ApiResponse.success(res, "Blog post created successfully", blog, 201);
    }

    async getAll(req: Request, res: Response): Promise<Response> {
        const query: IQueryParams = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || PAGINATION_PAGE_LIMIT,
            search: (req.query.search as string) || "",
            sortBy: (req.query.sortBy as string) || "createdAt",
            sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
        };

        const blogs = await this.blogService.getAll(query);

        return ApiResponse.success(res, "Blog posts fetched successfully", blogs);
    }


    async getById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        if (!id) throw new ApiError("Blog identifier is required", 400, ErrorCode.BAD_REQUEST);

        const includeDrafts = req.query.includeDrafts === "true";
        const blog = await this.blogService.getById(id, includeDrafts);

        if (!blog) throw new ApiError("Blog post not found", 404, ErrorCode.NOT_FOUND);
        return ApiResponse.success(res, "Blog post fetched successfully", blog);
    }

    async getBySlug(req: Request, res: Response): Promise<Response> {
        const { slug } = req.params;
        if (!slug) throw new ApiError("Blog identifier is required", 400, ErrorCode.BAD_REQUEST);

        const includeDrafts = req.query.includeDrafts === "true";
        const blog = await this.blogService.getBySlug(slug, includeDrafts);

        if (!blog) throw new ApiError("Blog post not found", 404, ErrorCode.NOT_FOUND);
        return ApiResponse.success(res, "Blog post fetched successfully", blog);
    }

    async updateById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const updates: IUpdateBlogDto = req.body;

        if (!id) throw new ApiError("Blog ID is required", 400, ErrorCode.BAD_REQUEST);

        const updated = await this.blogService.update(id, updates);

        if (!updated) throw new ApiError("Blog post not found", 404, ErrorCode.NOT_FOUND);
        return ApiResponse.success(res, "Blog post updated successfully", updated);
    }

    async deleteById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        if (!id) throw new ApiError("Blog ID is required", 400, ErrorCode.BAD_REQUEST);
        const result = await this.blogService.delete(id);
        if (!result) throw new ApiError("Unable to delete blog post!", 404, ErrorCode.OPERATION_FAILED)

        return ApiResponse.success(res, "Blog post deleted successfully", null, 200);
    }

    async incrementViewCount(req: Request, res: Response): Promise<Response> {
        const { postId } = req.params;

        if (!postId) throw new ApiError("Blog ID is required", 400, ErrorCode.BAD_REQUEST);

        await this.blogService.incrementViewCount(postId);

        return ApiResponse.success(res, "View count incremented successfully", null, 200);
    }

    async addLike(req: Request, res: Response): Promise<Response> {
        const authUser = req.user as IAuthUser;
        const { postId } = req.params;

        if (!authUser)
            throw new ApiError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
        if (!postId)
            throw new ApiError("Post ID is required", 400, ErrorCode.BAD_REQUEST);

        await this.blogService.addLike(postId, authUser.id);

        return ApiResponse.success(res, "Like added successfully", null, 200);
    }

    async removeLike(req: Request, res: Response): Promise<Response> {
        const authUser = req.user as IAuthUser;
        const { postId } = req.params;

        if (!authUser)
            throw new ApiError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
        if (!postId)
            throw new ApiError("Post ID is required", 400, ErrorCode.BAD_REQUEST);

        await this.blogService.removeLike(postId, authUser.id);

        return ApiResponse.success(res, "Like removed successfully", null, 200);
    }

    async schedule(req: Request, res: Response): Promise<Response> {
        const { postId } = req.params;
        const { publishDate } = req.body;

        if (!postId || !publishDate)
            throw new ApiError("Post ID and publish date are required", 400, ErrorCode.BAD_REQUEST);

        const scheduled = await this.blogService.schedule(
            postId,
            new Date(publishDate)
        );

        if (!scheduled)
            throw new ApiError("Blog post not found", 404, ErrorCode.NOT_FOUND);

        return ApiResponse.success(res, "Blog post scheduled successfully", scheduled);
    }

    async publish(req: Request, res: Response): Promise<Response> {
        const { postId } = req.params;

        if (!postId)
            throw new ApiError("Post ID is required", 400, ErrorCode.BAD_REQUEST);

        const published = await this.blogService.publish(postId);

        if (!published)
            throw new ApiError("Blog post not found", 404, ErrorCode.NOT_FOUND);

        return ApiResponse.success(res, "Blog post published successfully", published);
    }

    async archive(req: Request, res: Response): Promise<Response> {
        const { postId } = req.params;

        if (!postId)
            throw new ApiError("Post ID is required", 400, ErrorCode.BAD_REQUEST);

        const archived = await this.blogService.archive(postId);

        if (!archived)
            throw new ApiError("Blog post not found", 404, ErrorCode.NOT_FOUND);

        return ApiResponse.success(res, "Blog post archived successfully", archived);
    }
}

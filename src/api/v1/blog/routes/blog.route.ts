import { Router } from "express";
import {
    createBlogSchema,
    scheduleBlogSchema,
    updateBlogSchema,
} from "../validations/blog.validation";
import { BlogRepository } from "../repositories/blog.repository";
import { BlogService } from "../services/blog.service";
import { BlogController } from "../controllers/blog.controller";
import { validateBody } from "../../common/middlewares/validate.middleware";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { authenticate } from "../../auth/middlewares/auth.middleware";
import { authorize } from "../../permissions/middlewares/authorize.middleware";
import { PERMISSIONS } from "../../permissions/constants/permission";
import { authorizeUserAction } from "../../permissions/middlewares/authorizeUserAction.middleware";

export const blogRouter = Router();

// DI chain
const blogRepository = new BlogRepository();
const blogService = new BlogService(blogRepository);
const blogController = new BlogController(blogService);

/**
 * @route   GET /api/v1/blogs
 * @desc    Get all blog posts (with filters)
 * @access  Public
 */
blogRouter.get(
    "/",
    authenticate,
    authorize(PERMISSIONS.BLOG.READ_ALL),
    asyncHandler(blogController.getAll.bind(blogController))
);

/**
 * @route   GET /api/v1/blogs/:id
 * @desc    Get a single blog post by ID
 * @access  Public
 */
blogRouter.get(
    "/:id",
    authenticate,
    authorize(PERMISSIONS.BLOG.READ),
    asyncHandler(blogController.getById.bind(blogController))
);

/**
 * @route   GET /api/v1/blogs/slug/:slug
 * @desc    Get a single blog post by slug
 * @access  Public
 */
blogRouter.get(
    "/slug/:slug",
    asyncHandler(blogController.getBySlug.bind(blogController))
);

/**
 * @route   POST /api/v1/blogs
 * @desc    Create a new blog post
 * @access  Private (requires BLOG_CREATE permission)
 */
blogRouter.post(
    "/",
    authenticate,
    authorize(PERMISSIONS.BLOG.CREATE),
    validateBody(createBlogSchema),
    asyncHandler(blogController.create.bind(blogController))
);

/**
 * @route   PATCH /api/v1/blogs/:id
 * @desc    Update an existing blog post
 * @access  Private (requires BLOG_EDIT permission)
 */
blogRouter.patch(
    "/:id",
    authenticate,
    authorize(PERMISSIONS.BLOG.EDIT),
    authorizeUserAction(),
    validateBody(updateBlogSchema),
    asyncHandler(blogController.updateById.bind(blogController))
);

/**
 * @route   DELETE /api/v1/blogs/:id
 * @desc    Delete a blog post
 * @access  Private (requires BLOG_DELETE permission)
 */
blogRouter.delete(
    "/:id",
    authenticate,
    authorize(PERMISSIONS.BLOG.DELETE),
    authorizeUserAction(),
    asyncHandler(blogController.deleteById.bind(blogController))
);

/**
 * @route   PATCH /api/v1/blogs/:id/view
 * @desc    Increment blog post view count
 * @access  Public
 */
blogRouter.patch(
    "/:postId/view",
    asyncHandler(blogController.incrementViewCount.bind(blogController))
);

/**
 * @route   POST /api/v1/blogs/:id/like
 * @desc    Like a blog post
 * @access  Private
 */
blogRouter.post(
    "/:postId/like",
    authenticate,
    asyncHandler(blogController.addLike.bind(blogController))
);

/**
 * @route   DELETE /api/v1/blogs/:id/unlike
 * @desc    Remove like from a blog post
 * @access  Private
 */
blogRouter.delete(
    "/:postId/unlike",
    authenticate,
    asyncHandler(blogController.removeLike.bind(blogController))
);

/**
 * @route   POST /api/v1/blogs/:id/schedule
 * @desc    Schedule blog for publishing
 * @access  Private (requires BLOG_EDIT permission)
 */
blogRouter.post(
    "/:id/schedule",
    authenticate,
    authorize(PERMISSIONS.BLOG.EDIT),
    authorizeUserAction(),
    validateBody(scheduleBlogSchema),
    asyncHandler(blogController.schedule.bind(blogController))
);

/**
 * @route   PATCH /api/v1/blogs/:id/publish
 * @desc    Publish a blog immediately
 * @access  Private (requires BLOG_EDIT permission)
 */
blogRouter.patch(
    "/:id/publish",
    authenticate,
    authorize(PERMISSIONS.BLOG.EDIT),
    authorizeUserAction(),
    asyncHandler(blogController.publish.bind(blogController))
);

/**
 * @route   PATCH /api/v1/blogs/:id/archive
 * @desc    Archive a blog post
 * @access  Private (requires BLOG_EDIT permission)
 */
blogRouter.patch(
    "/:id/archive",
    authenticate,
    authorize(PERMISSIONS.BLOG.EDIT),
    authorizeUserAction(),
    asyncHandler(blogController.archive.bind(blogController))
);

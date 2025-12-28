import { z } from "zod";
import { IBlogPostStatus, IBlogPostVisibility } from "../models/blog.entity";

/**
 * Featured Image Schema
 */
const featuredImageSchema = z.object({
    url: z.string().url("Invalid image URL"),
    alt: z.string().max(100).nullable().optional(),
    caption: z.string().max(200).nullable().optional(),
});

/**
 * SEO Schema
 */
const seoSchema = z.object({
    metaTitle: z.string().max(120).nullable().optional(),
    metaDescription: z.string().max(160).nullable().optional(),
    keywords: z.array(z.string().trim().min(1)).optional(),
    ogImage: z.string().url("Invalid OG image URL").nullable().optional(),
});

/**
 * Create Blog Schema
 */
export const createBlogSchema = z
    .object({
        title: z.string().min(10, "Title must be at least 10 characters").max(200),
        slug: z
            .string()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly")
            .optional(),
        content: z.string().min(100, "Content must be at least 100 characters"),
        excerpt: z.string().max(300).optional(),

        author: z.string().optional(),
        category: z.string(),
        tags: z.array(z.string().trim().min(1)).optional(),

        featuredImage: featuredImageSchema.optional(),

        status: z
            .enum([IBlogPostStatus.DRAFT, IBlogPostStatus.PUBLISHED, IBlogPostStatus.ARCHIVED])
            .optional()
            .default(IBlogPostStatus.DRAFT),
        visibility: z
            .enum([IBlogPostVisibility.PUBLIC, IBlogPostVisibility.PRIVATE])
            .optional()
            .default(IBlogPostVisibility.PUBLIC),

        seo: seoSchema.optional(),

        scheduledFor: z.coerce.date().nullable().optional(),
    })
    .strict();

/**
 * Update Blog Schema
 */
export const updateBlogSchema = z
    .object({
        title: z.string().min(10).max(200).optional(),
        slug: z
            .string()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
            .optional(),
        content: z.string().min(100).optional(),
        excerpt: z.string().max(300).optional(),

        category: z.string().uuid("Invalid category ID").optional(),
        tags: z.array(z.string().trim().min(1)).optional(),
        featuredImage: featuredImageSchema.nullable().optional(),

        status: z
            .enum([IBlogPostStatus.DRAFT, IBlogPostStatus.PUBLISHED, IBlogPostStatus.ARCHIVED])
            .optional(),
        visibility: z
            .enum([IBlogPostVisibility.PUBLIC, IBlogPostVisibility.PRIVATE])
            .optional(),

        seo: seoSchema.nullable().optional(),

        publishedAt: z.coerce.date().nullable().optional(),
        scheduledFor: z.coerce.date().nullable().optional(),
    })
    .strict()
    .refine(
        (data) => Object.values(data).some((v) => v !== undefined && v !== null),
        { message: "At least one field must be provided for update." }
    );

/**
 *  Schedule Blog Schema
 */
export const scheduleBlogSchema = z
    .object({
        scheduledFor: z.coerce.date().refine((date) => date > new Date(), {
            message: "Scheduled date must be in the future",
        }),
    })
    .strict();

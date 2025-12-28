import {
    IBlogPostStatus,
    IBlogPostVisibility,
    IBlogSEO,
    IFeaturedImage,
} from "./blog.entity";

export interface ICreateBlogDto {
    title: string;
    slug?: string;
    content: string;
    excerpt?: string;
    author?: string;
    category: string;
    tags?: string[];
    featuredImage?: IFeaturedImage;
    status?: IBlogPostStatus;
    visibility?: IBlogPostVisibility;
    seo?: IBlogSEO;
    scheduledFor?: Date;
}

export interface IUpdateBlogDto {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    featuredImage?: IFeaturedImage | null;
    status?: IBlogPostStatus;
    visibility?: IBlogPostVisibility;
    seo?: IBlogSEO | null;
    publishedAt?: Date | null;
    scheduledFor?: Date | null;
}

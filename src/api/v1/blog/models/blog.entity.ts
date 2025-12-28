import { ICreateDto } from "../../common/models/common.dto";

export enum IBlogPostStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived",
    SCHEDULED = "scheduled",
}

export enum IBlogPostVisibility {
    PUBLIC = "public",
    PRIVATE = "private",
    UNLISTED = "unlisted",
}

export interface IFeaturedImage {
    url: string;
    alt?: string;
    caption?: string;
}

export interface IBlogLike {
    user: string;
    likedAt: Date;
}

export interface IBlogSEO {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
}

export interface IBlogPostEntity extends ICreateDto {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    author: string;
    category: string;
    tags: string[];
    featuredImage?: IFeaturedImage;
    status: IBlogPostStatus;
    visibility: IBlogPostVisibility;
    viewCount: number;
    likes: IBlogLike[];
    readTime: number;
    seo?: IBlogSEO;
    publishedAt?: Date;
    scheduledFor?: Date;
}

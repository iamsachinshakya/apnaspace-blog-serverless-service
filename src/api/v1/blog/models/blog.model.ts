import mongoose, { Schema, Document, Types } from "mongoose";
import {
    IBlogPostEntity,
    IBlogPostStatus,
    IBlogPostVisibility,
    IBlogSEO,
    IFeaturedImage,
} from "./blog.entity";

interface IBlogLikeMongo {
    user: Types.ObjectId;
    likedAt: Date;
}

export interface IBlog
    extends Omit<
        IBlogPostEntity,
        "id" | "author" | "category" | "likes"
    >,
    Document {
    _id: Types.ObjectId;
    author: Types.ObjectId;
    category: Types.ObjectId;
    likes: IBlogLikeMongo[];
}

const FeaturedImageSchema = new Schema<IFeaturedImage>(
    {
        url: { type: String, required: true, trim: true },
        alt: { type: String, default: null },
        caption: { type: String, default: null },
    },
    { _id: false }
);

const SeoSchema = new Schema<IBlogSEO>(
    {
        metaTitle: { type: String, default: null },
        metaDescription: { type: String, default: null },
        keywords: [{ type: String, lowercase: true, trim: true }],
        ogImage: { type: String, default: null },
    },
    { _id: false }
);

const LikeSchema = new Schema<IBlogLikeMongo>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        likedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const BlogSchema = new Schema<IBlog>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 200,
        },

        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
            immutable: true,
        },

        content: {
            type: String,
            required: true,
            minlength: 100,
        },

        excerpt: {
            type: String,
            maxlength: 300,
            default: null,
        },

        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
            immutable: true,
        },

        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true,
        },

        tags: [{ type: String, lowercase: true, trim: true }],

        featuredImage: {
            type: FeaturedImageSchema,
            default: null,
        },

        status: {
            type: String,
            enum: Object.values(IBlogPostStatus),
            default: IBlogPostStatus.DRAFT,
            index: true,
        },

        visibility: {
            type: String,
            enum: Object.values(IBlogPostVisibility),
            default: IBlogPostVisibility.PUBLIC,
            index: true,
        },

        viewCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        likes: {
            type: [LikeSchema],
            default: [],
        },

        readTime: {
            type: Number,
            default: 0,
            min: 0,
        },

        seo: {
            type: SeoSchema,
            default: null,
        },

        publishedAt: {
            type: Date,
            default: null,
            index: true,
        },

        scheduledFor: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

BlogSchema.index({ slug: 1 }, { unique: true });

BlogSchema.index({
    status: 1,
    visibility: 1,
    publishedAt: -1,
});

BlogSchema.index({ viewCount: -1 });
BlogSchema.index({ createdAt: -1 });

BlogSchema.index(
    {
        title: "text",
        excerpt: "text",
        content: "text",
        tags: "text",
    },
    {
        weights: {
            title: 5,
            tags: 3,
            excerpt: 2,
            content: 1,
        },
    }
);

const Blog = mongoose.model<IBlog>("Blog", BlogSchema);
export default Blog;

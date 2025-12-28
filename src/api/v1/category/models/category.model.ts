import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    description: string;
    icon: string | null;
    color: string;
    parentId: string | null;
    postCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            maxlength: 1000,
        },

        icon: {
            type: String,
            default: null,
        },

        color: {
            type: String,
            default: "#6366f1",
        },

        parentId: {
            type: String,
            default: null,
        },

        postCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

//
// ---------------- INDEXES ----------------
//

// Unique & lookup
CategorySchema.index({ slug: 1 }, { unique: true });

// Hierarchy queries
CategorySchema.index({ parentId: 1 });

// Filtering & sorting
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ postCount: -1 });
CategorySchema.index({ createdAt: -1 });

// Search
CategorySchema.index(
    { name: "text", description: "text" },
    { weights: { name: 5, description: 1 } }
);

const Category = mongoose.model<ICategory>("Category", CategorySchema);

export default Category;

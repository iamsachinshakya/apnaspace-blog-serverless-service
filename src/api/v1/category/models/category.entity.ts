import { ICreateDto } from "../../common/models/common.dto";

/**
 * Pure domain model — DB agnostic
 */
export interface ICategoryEntity extends ICreateDto {
    id: string;
    name: string; // e.g. machine learning
    slug: string; // e.g. machine-learning
    description: string;
    icon: string;
    color: string;
    parentId: string | null;
    postCount: number;
    isActive: boolean;
}

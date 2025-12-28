
export interface ICreateCategory {
    name: string;
    slug?: string;
    description: string;
    icon: string | null;
    color: string;
    parentId: string | null;
    isActive: boolean;
}

export interface IUpdateCategory {
    name: string;
    slug?: string;
    description: string;
    color: string;
    parentId: string | null;
    isActive: boolean;
    icon: string | null;
}
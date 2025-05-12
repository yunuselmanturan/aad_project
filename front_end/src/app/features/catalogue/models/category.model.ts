// category.model.ts
export interface Category {
  id: number;
  name: string;
  parentCategoryId?: number;  // Add parentCategoryId to track hierarchy
}

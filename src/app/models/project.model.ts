export type ProjectCategoryId = 'all' | 'landscaping' | 'irrigation' | 'special' | 'outdoor' | 'fences';

export interface Project {
  id: string;
  titleKey: string;
  descriptionKey: string;
  categoryId: Exclude<ProjectCategoryId, 'all'>;
  image: string;
  locationKey: string;
  year?: string;
}


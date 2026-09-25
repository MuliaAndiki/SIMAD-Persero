export interface GuideItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  videoUrl: string | null;
  content: string;
  category: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GuideQuery {
  category?: string;
  isPublished?: boolean | string;
  keyword?: string;
}

export interface CreateGuideBody {
  title: string;
  slug?: string;
  description?: string;
  videoUrl?: string;
  content: string;
  category: string;
  displayOrder?: number;
  isPublished?: boolean;
}

export type UpdateGuideBody = Partial<CreateGuideBody>;

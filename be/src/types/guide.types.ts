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

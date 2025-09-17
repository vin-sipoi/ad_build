// CMS and Content Management Types
export interface CMSContent {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  type: 'course' | 'blog' | 'announcement' | 'resource';
  status: 'draft' | 'published' | 'archived';
  authorId: string;
  tags: string[];
  metadata: ContentMetadata;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ContentMetadata {
  description?: string;
  thumbnail?: string;
  seoTitle?: string;
  seoDescription?: string;
  readTime?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface CMSUser {
  userId: string;
  permissions: CMSPermission[];
  lastLogin: Date;
}

export interface CMSPermission {
  resource: 'courses' | 'users' | 'content' | 'settings' | 'analytics';
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
  category: string;
  isActive: boolean;
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'image' | 'video' | 'file';
  required: boolean;
  options?: string[];
  validation?: FieldValidation;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  fileTypes?: string[];
  maxFileSize?: number;
}

// Model Types
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  nim?: string;
  nidn?: string;
  niyp?: string;
  bio?: string;
  avatar?: string;
  cover_image?: string;
  is_active: boolean;
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  description?: string;
  content: string;
  thumbnail?: string;
  featured_image?: string;
  tags?: string[];
  tech_stack?: string[];
  category: 'web' | 'mobile' | 'desktop' | 'ai-ml' | 'iot' | 'game' | 'other';
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'unlisted' | 'private';
  is_featured: boolean;
  allow_comments: boolean;
  view_count: number;
  like_count: number;
  save_count: number;
  comment_count: number;
  share_count: number;
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  collaborators?: Collaborator[];
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface Comment {
  id: number;
  project_id: number;
  user_id: number;
  parent_id?: number;
  body: string;
  is_approved: boolean;
  is_pinned: boolean;
  like_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: Comment[];
  is_liked?: boolean;
}

export interface Collaborator {
  id: number;
  project_id: number;
  user_id: number;
  role: 'pembimbing' | 'kolaborator' | 'contributor';
  can_edit: boolean;
  can_delete: boolean;
  status: 'invited' | 'accepted' | 'declined';
  invited_by?: number;
  invited_at: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Challenge {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  description: string;
  rules?: string;
  banner?: string;
  requirements?: any;
  allowed_categories?: string[];
  start_date?: string;
  deadline?: string;
  announcement_date?: string;
  winner_project_id?: number;
  winner_announced_at?: string;
  participant_count: number;
  submission_count: number;
  status: 'draft' | 'open' | 'closed' | 'completed';
  is_featured: boolean;
  max_participants?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  winner_project?: Project;
  user_submission?: ChallengeSubmission;
}

export interface ChallengeSubmission {
  id: number;
  challenge_id: number;
  user_id: number;
  project_id?: number;
  status: 'joined' | 'submitted' | 'withdrawn';
  submitted_at?: string;
  score?: number;
  rank?: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  project?: Project;
  challenge?: Challenge;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url?: string;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'mahasiswa' | 'dosen';
  nim?: string;
  nidn?: string;
  niyp?: string;
}

export interface ProjectFormData {
  title: string;
  description?: string;
  content: string;
  thumbnail?: File | string;
  featured_image?: File | string;
  tags?: string[];
  tech_stack?: string[];
  category: string;
  status: string;
  visibility: string;
  allow_comments: boolean;
  collaborators?: Array<{
    user_id: number;
    role: string;
    can_edit: boolean;
    can_delete: boolean;
  }>;
}

export interface CommentFormData {
  body: string;
  parent_id?: number;
}

export interface ChallengeFormData {
  title: string;
  description: string;
  rules?: string;
  banner?: File | string;
  requirements?: any;
  allowed_categories?: string[];
  start_date?: string;
  deadline?: string;
  announcement_date?: string;
  max_participants?: number;
}

export interface ProfileUpdateData {
  name: string;
  username: string;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
}

// Filter Types
export interface ProjectFilters {
  category?: string;
  search?: string;
  tags?: string[];
  sort?: 'latest' | 'popular' | 'most_viewed';
  status?: string;
  page?: number;
}

export interface ChallengeFilters {
  status?: string;
  search?: string;
  sort?: 'latest' | 'deadline';
  page?: number;
}

// Dashboard Stats
export interface DashboardStats {
  projects_count: number;
  published_projects_count: number;
  draft_projects_count: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  saved_projects_count: number;
  challenges_joined: number;
  challenges_submitted: number;
}

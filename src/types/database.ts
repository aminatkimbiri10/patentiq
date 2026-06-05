export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

import type { AppRole } from "@/types/roles";

export type { AppRole };

export type ProjectStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "awaiting_documents"
  | "expert_review"
  | "cpi_review"
  | "approved"
  | "rejected"
  | "closed";

export type DocumentStatus = "uploading" | "active" | "archived" | "deleted";

export type AiSearchStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type AiSearchType =
  | "novelty"
  | "semantic"
  | "similarity"
  | "summarization"
  | "classification"
  | "tag_suggestion"
  | "assistant"
  | "report";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  phone: string | null;
  bio: string | null;
  job_title: string | null;
  locale: string;
  timezone: string;
  onboarding_completed: boolean;
  metadata: Json;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  role_name: AppRole;
  display_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  is_primary: boolean;
  assigned_by: string | null;
  assigned_at: string;
  created_at: string;
  roles?: Role;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  invention_summary: string | null;
  need_description: string | null;
  status: ProjectStatus;
  visibility: "private" | "team" | "internal";
  owner_id: string;
  assigned_to: string | null;
  expert_id: string | null;
  category_id: string | null;
  reference_code: string | null;
  due_at: string | null;
  closed_at: string | null;
  last_activity_at: string;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  owner_id: string;
  uploaded_by: string;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  bucket_id: string;
  mime_type: string | null;
  file_size: number | null;
  status: DocumentStatus;
  version_number: number;
  is_latest: boolean;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  project_id: string | null;
  notification_type: string;
  title: string;
  body: string | null;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  project_id: string | null;
  created_at: string;
}

export interface AiSearch {
  id: string;
  project_id: string;
  requested_by: string;
  search_type: AiSearchType;
  status: AiSearchStatus;
  query: string | null;
  parameters: Json;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface AiResult {
  id: string;
  search_id: string;
  result_type: string;
  title: string | null;
  summary: string | null;
  score: number | null;
  rank: number | null;
  source_ref: string | null;
  payload: Json;
  metadata: Json;
  created_at: string;
}

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile, Partial<Profile> & { id: string; email: string }>;
      projects: TableDef<
        Project,
        {
          title: string;
          owner_id: string;
          description?: string | null;
          invention_summary?: string | null;
          need_description?: string | null;
          category_id?: string | null;
          status?: ProjectStatus;
        }
      >;
      documents: TableDef<Document>;
      notifications: TableDef<Notification>;
      roles: TableDef<Role>;
      user_roles: TableDef<UserRole, { user_id: string; role_id: string; is_primary?: boolean }>;
      ai_searches: TableDef<
        AiSearch,
        {
          project_id: string;
          requested_by: string;
          search_type?: AiSearchType;
          status?: AiSearchStatus;
          query?: string | null;
          parameters?: Json;
        }
      >;
      audit_logs: TableDef<AuditLog>;
    };
    Views: Record<string, never>;
    Functions: {
      has_role: { Args: { p_role: AppRole }; Returns: boolean };
      can_view_project: { Args: { p_project_id: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

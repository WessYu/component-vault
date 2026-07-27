export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; name: string | null; avatar_url: string | null; created_at: string };
        Insert: { id: string; name?: string | null; avatar_url?: string | null; created_at?: string };
        Update: { id?: string; name?: string | null; avatar_url?: string | null; created_at?: string };
      };
      components: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          description: string | null;
          category_id: string | null;
          framework: string;
          language: string;
          code: string;
          styles: string | null;
          usage_code: string | null;
          notes: string | null;
          version: string;
          is_favorite: boolean;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          description?: string | null;
          category_id?: string | null;
          framework?: string;
          language?: string;
          code: string;
          styles?: string | null;
          usage_code?: string | null;
          notes?: string | null;
          version?: string;
          is_favorite?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["components"]["Insert"]>;
      };
      categories: { Row: { id: string; user_id: string; name: string; slug: string; icon: string | null; color: string | null }; Insert: { id?: string; user_id: string; name: string; slug: string; icon?: string | null; color?: string | null }; Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]> };
      collections: { Row: { id: string; user_id: string; name: string; description: string | null; created_at: string; updated_at: string }; Insert: { id?: string; user_id: string; name: string; description?: string | null; created_at?: string; updated_at?: string }; Update: Partial<Database["public"]["Tables"]["collections"]["Insert"]> };
      collection_components: { Row: { collection_id: string; component_id: string }; Insert: { collection_id: string; component_id: string }; Update: { collection_id?: string; component_id?: string } };
      tags: { Row: { id: string; user_id: string; name: string }; Insert: { id?: string; user_id: string; name: string }; Update: { id?: string; user_id?: string; name?: string } };
      component_tags: { Row: { component_id: string; tag_id: string }; Insert: { component_id: string; tag_id: string }; Update: { component_id?: string; tag_id?: string } };
      component_versions: { Row: { id: string; component_id: string; version: string; code: string; styles: string | null; created_at: string }; Insert: { id?: string; component_id: string; version: string; code: string; styles?: string | null; created_at?: string }; Update: { id?: string; component_id?: string; version?: string; code?: string; styles?: string | null; created_at?: string } };
      component_usage: { Row: { id: string; component_id: string; project_name: string; location: string; url: string | null }; Insert: { id?: string; component_id: string; project_name: string; location: string; url?: string | null }; Update: { id?: string; component_id?: string; project_name?: string; location?: string; url?: string | null } };
      design_tokens: { Row: { id: string; user_id: string; type: string; name: string; value: string }; Insert: { id?: string; user_id: string; type: string; name: string; value: string }; Update: { id?: string; user_id?: string; type?: string; name?: string; value?: string } };
    };
  };
};

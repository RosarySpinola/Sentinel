export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      sentinel_users: {
        Row: {
          wallet_address: string;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: {
          wallet_address: string;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
        Update: {
          wallet_address?: string;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
        Relationships: [];
      };
      sentinel_projects: {
        Row: {
          id: string;
          wallet_address: string;
          name: string;
          description: string | null;
          network: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          name: string;
          description?: string | null;
          network?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          name?: string;
          description?: string | null;
          network?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sentinel_projects_wallet_address_fkey";
            columns: ["wallet_address"];
            referencedRelation: "sentinel_users";
            referencedColumns: ["wallet_address"];
          },
        ];
      };
      sentinel_simulations: {
        Row: {
          id: string;
          wallet_address: string;
          project_id: string | null;
          network: string;
          sender_address: string;
          module_address: string;
          module_name: string;
          function_name: string;
          type_arguments: Json;
          arguments: Json;
          success: boolean;
          gas_used: number | null;
          vm_status: string | null;
          state_changes: Json;
          events: Json;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          project_id?: string | null;
          network: string;
          sender_address: string;
          module_address: string;
          module_name: string;
          function_name: string;
          type_arguments?: Json;
          arguments?: Json;
          success: boolean;
          gas_used?: number | null;
          vm_status?: string | null;
          state_changes?: Json;
          events?: Json;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          project_id?: string | null;
          network?: string;
          sender_address?: string;
          module_address?: string;
          module_name?: string;
          function_name?: string;
          type_arguments?: Json;
          arguments?: Json;
          success?: boolean;
          gas_used?: number | null;
          vm_status?: string | null;
          state_changes?: Json;
          events?: Json;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sentinel_simulations_wallet_address_fkey";
            columns: ["wallet_address"];
            referencedRelation: "sentinel_users";
            referencedColumns: ["wallet_address"];
          },
          {
            foreignKeyName: "sentinel_simulations_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "sentinel_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      sentinel_prover_runs: {
        Row: {
          id: string;
          wallet_address: string;
          project_id: string | null;
          code: string;
          modules: Json;
          status: string;
          duration_ms: number | null;
          results: Json | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          project_id?: string | null;
          code: string;
          modules?: Json;
          status: string;
          duration_ms?: number | null;
          results?: Json | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          project_id?: string | null;
          code?: string;
          modules?: Json;
          status?: string;
          duration_ms?: number | null;
          results?: Json | null;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sentinel_prover_runs_wallet_address_fkey";
            columns: ["wallet_address"];
            referencedRelation: "sentinel_users";
            referencedColumns: ["wallet_address"];
          },
          {
            foreignKeyName: "sentinel_prover_runs_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "sentinel_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      sentinel_api_keys: {
        Row: {
          id: string;
          wallet_address: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          last_used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          last_used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          name?: string;
          key_hash?: string;
          key_prefix?: string;
          last_used_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sentinel_api_keys_wallet_address_fkey";
            columns: ["wallet_address"];
            referencedRelation: "sentinel_users";
            referencedColumns: ["wallet_address"];
          },
        ];
      };
      sentinel_teams: {
        Row: {
          id: string;
          name: string;
          owner_wallet: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_wallet: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_wallet?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sentinel_teams_owner_wallet_fkey";
            columns: ["owner_wallet"];
            referencedRelation: "sentinel_users";
            referencedColumns: ["wallet_address"];
          },
        ];
      };
      sentinel_team_members: {
        Row: {
          id: string;
          team_id: string;
          wallet_address: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          wallet_address: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          wallet_address?: string;
          role?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sentinel_team_members_team_id_fkey";
            columns: ["team_id"];
            referencedRelation: "sentinel_teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sentinel_team_members_wallet_address_fkey";
            columns: ["wallet_address"];
            referencedRelation: "sentinel_users";
            referencedColumns: ["wallet_address"];
          },
        ];
      };
      sentinel_team_invites: {
        Row: {
          id: string;
          team_id: string;
          invite_token: string;
          invited_by: string;
          role: string;
          expires_at: string;
          used_at: string | null;
          used_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          invite_token: string;
          invited_by: string;
          role?: string;
          expires_at: string;
          used_at?: string | null;
          used_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          invite_token?: string;
          invited_by?: string;
          role?: string;
          expires_at?: string;
          used_at?: string | null;
          used_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sentinel_team_invites_team_id_fkey";
            columns: ["team_id"];
            referencedRelation: "sentinel_teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sentinel_team_invites_invited_by_fkey";
            columns: ["invited_by"];
            referencedRelation: "sentinel_users";
            referencedColumns: ["wallet_address"];
          },
          {
            foreignKeyName: "sentinel_team_invites_used_by_fkey";
            columns: ["used_by"];
            referencedRelation: "sentinel_users";
            referencedColumns: ["wallet_address"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier access
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

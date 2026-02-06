export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_trail: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          action_details: Json | null
          contract_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          action_details?: Json | null
          contract_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          action_details?: Json | null
          contract_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      clauses: {
        Row: {
          category: Database["public"]["Enums"]["clause_category"] | null
          clause_number: number
          compliance_flags: Json | null
          contract_id: string
          created_at: string
          id: string
          is_flagged: boolean | null
          negotiation_script: string | null
          original_text: string
          plain_explanation: string | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          risk_rationale: string | null
          risk_score: number | null
          similarity_score: number | null
          suggested_alternative: string | null
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["clause_category"] | null
          clause_number: number
          compliance_flags?: Json | null
          contract_id: string
          created_at?: string
          id?: string
          is_flagged?: boolean | null
          negotiation_script?: string | null
          original_text: string
          plain_explanation?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_rationale?: string | null
          risk_score?: number | null
          similarity_score?: number | null
          suggested_alternative?: string | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["clause_category"] | null
          clause_number?: number
          compliance_flags?: Json | null
          contract_id?: string
          created_at?: string
          id?: string
          is_flagged?: boolean | null
          negotiation_script?: string | null
          original_text?: string
          plain_explanation?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_rationale?: string | null
          risk_score?: number | null
          similarity_score?: number | null
          suggested_alternative?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clauses_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          content: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          risk_posture: string | null
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          risk_posture?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: string
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          risk_posture?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          analysis_status: string | null
          analyzed_at: string | null
          composite_risk_score: number | null
          contract_type: Database["public"]["Enums"]["contract_type"] | null
          created_at: string
          effective_date: string | null
          executive_summary: string | null
          expiry_date: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          jurisdiction: string | null
          language: string | null
          parties: Json | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_status?: string | null
          analyzed_at?: string | null
          composite_risk_score?: number | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string
          effective_date?: string | null
          executive_summary?: string | null
          expiry_date?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          jurisdiction?: string | null
          language?: string | null
          parties?: Json | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_status?: string | null
          analyzed_at?: string | null
          composite_risk_score?: number | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string
          effective_date?: string | null
          executive_summary?: string | null
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          jurisdiction?: string | null
          language?: string | null
          parties?: Json | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      glossary_terms: {
        Row: {
          category: string | null
          created_at: string
          definition_en: string
          definition_hi: string | null
          example_usage: string | null
          id: string
          term: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          definition_en: string
          definition_hi?: string | null
          example_usage?: string | null
          id?: string
          term: string
        }
        Update: {
          category?: string | null
          created_at?: string
          definition_en?: string
          definition_hi?: string | null
          example_usage?: string | null
          id?: string
          term?: string
        }
        Relationships: []
      }
      user_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          template_id: string | null
          updated_at: string
          user_id: string
          variables_filled: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          template_id?: string | null
          updated_at?: string
          user_id: string
          variables_filled?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          template_id?: string | null
          updated_at?: string
          user_id?: string
          variables_filled?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      audit_action:
        | "upload"
        | "analyze"
        | "export"
        | "template_generated"
        | "clause_edited"
        | "version_created"
      clause_category:
        | "obligations"
        | "rights"
        | "prohibitions"
        | "termination"
        | "indemnity"
        | "liability"
        | "confidentiality"
        | "ip_transfer"
        | "non_compete"
        | "auto_renewal"
        | "payment"
        | "dispute_resolution"
        | "other"
      contract_type:
        | "employment_agreement"
        | "vendor_contract"
        | "lease_agreement"
        | "partnership_deed"
        | "service_contract"
        | "other"
      risk_level: "low" | "medium" | "high" | "critical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      audit_action: [
        "upload",
        "analyze",
        "export",
        "template_generated",
        "clause_edited",
        "version_created",
      ],
      clause_category: [
        "obligations",
        "rights",
        "prohibitions",
        "termination",
        "indemnity",
        "liability",
        "confidentiality",
        "ip_transfer",
        "non_compete",
        "auto_renewal",
        "payment",
        "dispute_resolution",
        "other",
      ],
      contract_type: [
        "employment_agreement",
        "vendor_contract",
        "lease_agreement",
        "partnership_deed",
        "service_contract",
        "other",
      ],
      risk_level: ["low", "medium", "high", "critical"],
    },
  },
} as const

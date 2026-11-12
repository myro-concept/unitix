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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      email_templates: {
        Row: {
          avatar_url: string | null
          company: string | null
          company_description: string | null
          company_slug: string | null
          created_at: string
          full_name: string | null
          id: string
          school: string | null
          social_links: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          company_description?: string | null
          company_slug?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          school: string | null
          social_links?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          company_description?: string | null
          company_slug?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          school: string | null
          social_links?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          background_image_url: string | null
          capacity: number | null
          color_mode: string | null
          created_at: string
          description: string | null
          event_date: string | null
          event_end_date: string | null
          event_type: string | null
          gallery_urls: string[]
          id: string
          location_type: string | null
          location_value: string | null
          logo_url: string | null
          name: string
          primary_color: string | null
          registration_deadline: string | null
          registration_limit: number | null
          refund_policy: string | null
          requires_approval: boolean | null
          slug: string
          status: Database["public"]["Enums"]["event_status"]
          template: string | null
          ticket_price: number | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          background_image_url?: string | null
          capacity?: number | null
          color_mode?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_end_date?: string | null
          event_type?: string | null
          gallery_urls?: string[]
          id?: string
          location_type?: string | null
          location_value?: string | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          registration_deadline?: string | null
          registration_limit?: number | null
          refund_policy?: string | null
          requires_approval?: boolean | null
          slug: string
          status?: Database["public"]["Enums"]["event_status"]
          template?: string | null
          ticket_price?: number | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          background_image_url?: string | null
          capacity?: number | null
          color_mode?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_end_date?: string | null
          event_type?: string | null
          gallery_urls?: string[]
          id?: string
          location_type?: string | null
          location_value?: string | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          registration_deadline?: string | null
          registration_limit?: number | null
          refund_policy?: string | null
          requires_approval?: boolean | null
          slug?: string
          status?: Database["public"]["Enums"]["event_status"]
          template?: string | null
          ticket_price?: number | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      featured_events: {
        Row: {
          created_at: string
          event_id: string
          slot: number
        }
        Insert: {
          created_at?: string
          event_id: string
          slot: number
        }
        Update: {
          created_at?: string
          event_id?: string
          slot?: number
        }
        Relationships: [
          {
            foreignKeyName: "featured_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_edit_history: {
        Row: {
          actor_id: string | null
          actor_email: string | null
          changed_at: string
          changes: Json
          event_id: string
          id: string
        }
        Insert: {
          actor_id?: string | null
          actor_email?: string | null
          changed_at?: string
          changes: Json
          event_id: string
          id?: string
        }
        Update: {
          actor_id?: string | null
          actor_email?: string | null
          changed_at?: string
          changes?: Json
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_edit_history_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_refund_policy_requests: {
        Row: {
          event_id: string
          id: string
          organizer_id: string
          requested_policy: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
        }
        Insert: {
          event_id: string
          id?: string
          organizer_id: string
          requested_policy: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
        }
        Update: {
          event_id?: string
          id?: string
          organizer_id?: string
          requested_policy?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_refund_policy_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          event_id: string
          field_type: string
          id: string
          label: string
          placeholder: string | null
          position: number
          required: boolean
        }
        Insert: {
          event_id: string
          field_type?: string
          id?: string
          label: string
          placeholder?: string | null
          position?: number
          required?: boolean
        }
        Update: {
          event_id?: string
          field_type?: string
          id?: string
          label?: string
          placeholder?: string | null
          position?: number
          required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          company_description: string | null
          company_slug: string | null
          created_at: string
          full_name: string | null
          id: string
          school: string | null
          social_links: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          company_description?: string | null
          company_slug?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          school: string | null
          social_links?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          company_description?: string | null
          company_slug?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          school: string | null
          social_links?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      issued_tickets: {
        Row: {
          amount_paid: number
          attendee_email: string
          attendee_name: string
          attendee_phone: string
          checked_in_at: string | null
          created_at: string
          event_id: string
          id: string
          registration_id: string
          status: string
          ticket_code: string
          ticket_type_id: string | null
          ticket_type_name: string
          token: string
        }
        Insert: {
          amount_paid?: number
          attendee_email: string
          attendee_name: string
          attendee_phone?: string
          checked_in_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          registration_id: string
          status?: string
          ticket_code?: string
          ticket_type_id?: string | null
          ticket_type_name: string
          token?: string
        }
        Update: {
          amount_paid?: number
          attendee_email?: string
          attendee_name?: string
          attendee_phone?: string
          checked_in_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          registration_id?: string
          status?: string
          ticket_code?: string
          ticket_type_id?: string | null
          ticket_type_name?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "issued_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issued_tickets_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          created_at: string
          data: Json
          event_id: string
          id: string
          payment_reference: string | null
          quantity: number
          status: Database["public"]["Enums"]["registration_status"]
          ticket_type_id: string | null
        }
        Insert: {
          created_at?: string
          data?: Json
          event_id: string
          id?: string
          payment_reference?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["registration_status"]
          ticket_type_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          event_id?: string
          id?: string
          payment_reference?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["registration_status"]
          ticket_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_types: {
        Row: {
          created_at: string
          event_id: string
          id: string
          name: string
          price: number
          quantity: number | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          name: string
          price?: number
          quantity?: number | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          name?: string
          price?: number
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_checkin_logs: {
        Row: {
          event_id: string
          id: string
          issued_ticket_id: string | null
          result: string
          scanned_at: string
          scanner_id: string
        }
        Insert: {
          event_id: string
          id?: string
          issued_ticket_id?: string | null
          result: string
          scanned_at?: string
          scanner_id: string
        }
        Update: {
          event_id?: string
          id?: string
          issued_ticket_id?: string | null
          result?: string
          scanned_at?: string
          scanner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_checkin_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_checkin_logs_issued_ticket_id_fkey"
            columns: ["issued_ticket_id"]
            isOneToOne: false
            referencedRelation: "issued_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          account_name: string | null
          account_number: string | null
          amount: number
          bank_name: string | null
          currency: string
          id: string
          organizer_company: string | null
          organizer_email: string
          organizer_id: string
          organizer_name: string
          organizer_phone: string | null
          paid_at: string | null
          paid_by: string | null
          paid_reference: string | null
          requested_at: string
          receipt_path: string | null
          status: string
          submission_id: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          amount: number
          bank_name?: string | null
          currency?: string
          id?: string
          organizer_company?: string | null
          organizer_email: string
          organizer_id: string
          organizer_name: string
          organizer_phone?: string | null
          paid_at?: string | null
          paid_by?: string | null
          paid_reference?: string | null
          requested_at?: string
          receipt_path?: string | null
          status?: string
          submission_id: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          currency?: string
          id?: string
          organizer_company?: string | null
          organizer_email?: string
          organizer_id?: string
          organizer_name?: string
          organizer_phone?: string | null
          paid_at?: string | null
          paid_by?: string | null
          paid_reference?: string | null
          requested_at?: string
          receipt_path?: string | null
          status?: string
          submission_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_registration_count: { Args: { p_event_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_event_schedule: {
        Args: {
          p_actor_email: string | null
          p_actor_id: string
          p_event_date: string | null
          p_event_end_date: string | null
          p_event_id: string
        }
        Returns: Database["public"]["Tables"]["events"]["Row"]
      }
      review_event_refund_policy_request: {
        Args: {
          p_decision: string
          p_request_id: string
          p_review_note?: string | null
        }
        Returns: string
      }
      create_withdrawal_request: {
        Args: { p_amount: number; p_submission_id: string }
        Returns: string
      }
      mark_withdrawal_paid: {
        Args: { p_paid_reference?: string | null; p_receipt_path?: string | null; p_request_id: string }
        Returns: string
      }
      check_in_ticket: {
        Args: { p_event_id: string; p_token: string }
        Returns: Json
      }
      check_in_ticket_by_code: {
        Args: { p_event_id: string; p_ticket_code: string }
        Returns: Json
      }
      record_invalid_ticket_scan: {
        Args: { p_event_id: string }
        Returns: Json
      }
      complete_ticket_checkout: {
        Args: {
          p_attendees: Json
          p_event_id: string
          p_payment_reference?: string | null
          p_quantity: number
          p_registration_data: Json
          p_ticket_name: string
          p_ticket_type_id: string | null
          p_verified_unit_price: number
        }
        Returns: Json
      }
      get_tickets_by_tokens: {
        Args: { p_tokens: string[] }
        Returns: Json
      }
      register_for_event: {
        Args: { p_data: Json; p_event_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
      email_template_type: "confirmation" | "reminder" | "followup"
      event_status: "draft" | "live" | "past"
      registration_status: "registered" | "checked_in" | "cancelled"
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
      app_role: ["admin", "editor", "viewer"],
      email_template_type: ["confirmation", "reminder", "followup"],
      event_status: ["draft", "live", "past"],
      registration_status: ["registered", "checked_in", "cancelled"],
    },
  },
} as const

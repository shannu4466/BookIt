export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          name: string
          password_hash: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          password_hash: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          password_hash?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      booking_data: {
        Row: {
          booking_date: string
          booking_fees: number
          booking_status: string
          created_at: string
          event_id: number | null
          event_title: string
          event_type: string
          id: string
          location: string
          payment_method: string
          payment_status: string
          price_per_ticket: number
          screen_hall: string | null
          seats: string[] | null
          show_time: string
          ticket_quantity: number
          total_amount: number
          updated_at: string
          user_id: string
          venue: string | null
        }
        Insert: {
          booking_date: string
          booking_fees?: number
          booking_status?: string
          created_at?: string
          event_id?: number | null
          event_title: string
          event_type: string
          id?: string
          location: string
          payment_method: string
          payment_status?: string
          price_per_ticket: number
          screen_hall?: string | null
          seats?: string[] | null
          show_time: string
          ticket_quantity?: number
          total_amount: number
          updated_at?: string
          user_id: string
          venue?: string | null
        }
        Update: {
          booking_date?: string
          booking_fees?: number
          booking_status?: string
          created_at?: string
          event_id?: number | null
          event_title?: string
          event_type?: string
          id?: string
          location?: string
          payment_method?: string
          payment_status?: string
          price_per_ticket?: number
          screen_hall?: string | null
          seats?: string[] | null
          show_time?: string
          ticket_quantity?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
          venue?: string | null
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          booking_id: string | null
          discount_amount: number
          id: string
          offer_id: string
          used_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          discount_amount?: number
          id?: string
          offer_id: string
          used_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          discount_amount?: number
          id?: string
          offer_id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          created_at: string
          description: string | null
          event_date: string | null
          event_time: string | null
          id: string
          image_url: string | null
          is_trending: boolean | null
          location: string
          price_range: string | null
          rating: number | null
          status: string | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          location: string
          price_range?: string | null
          rating?: number | null
          status?: string | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          location?: string
          price_range?: string | null
          rating?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      movies: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          genre: string
          id: string
          image_url: string | null
          is_trending: boolean | null
          language: string | null
          location: string
          price_range: string | null
          rating: number | null
          release_date: string | null
          show_times: string[] | null
          status: string | null
          title: string
          trailer_url: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          genre: string
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          language?: string | null
          location: string
          price_range?: string | null
          rating?: number | null
          release_date?: string | null
          show_times?: string[] | null
          status?: string | null
          title: string
          trailer_url?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          genre?: string
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          language?: string | null
          location?: string
          price_range?: string | null
          rating?: number | null
          release_date?: string | null
          show_times?: string[] | null
          status?: string | null
          title?: string
          trailer_url?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          category: string
          color_gradient: string
          coupon_code: string | null
          created_at: string
          description: string
          discount: string
          id: string
          image_url: string
          title: string
          valid_until: string
        }
        Insert: {
          category: string
          color_gradient: string
          coupon_code?: string | null
          created_at?: string
          description: string
          discount: string
          id?: string
          image_url: string
          title: string
          valid_until: string
        }
        Update: {
          category?: string
          color_gradient?: string
          coupon_code?: string | null
          created_at?: string
          description?: string
          discount?: string
          id?: string
          image_url?: string
          title?: string
          valid_until?: string
        }
        Relationships: []
      }
      plays: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          genre: string
          id: string
          image_url: string | null
          is_trending: boolean | null
          language: string | null
          location: string
          price_range: string | null
          rating: number | null
          show_times: string[] | null
          status: string | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          genre: string
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          language?: string | null
          location: string
          price_range?: string | null
          rating?: number | null
          show_times?: string[] | null
          status?: string | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          genre?: string
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          language?: string | null
          location?: string
          price_range?: string | null
          rating?: number | null
          show_times?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      seat_bookings: {
        Row: {
          booking_id: string | null
          created_at: string
          event_id: string
          event_type: string
          id: string
          is_available: boolean | null
          screen_hall: string | null
          seat_number: string
          show_date: string
          show_time: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          is_available?: boolean | null
          screen_hall?: string | null
          seat_number: string
          show_date: string
          show_time: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          is_available?: boolean | null
          screen_hall?: string | null
          seat_number?: string
          show_date?: string
          show_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_bookings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_data"
            referencedColumns: ["id"]
          },
        ]
      }
      sports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_trending: boolean | null
          location: string
          match_date: string | null
          match_time: string | null
          price_range: string | null
          rating: number | null
          sport_type: string
          status: string | null
          teams: string | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          location: string
          match_date?: string | null
          match_time?: string | null
          price_range?: string | null
          rating?: number | null
          sport_type: string
          status?: string | null
          teams?: string | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          location?: string
          match_date?: string | null
          match_time?: string | null
          price_range?: string | null
          rating?: number | null
          sport_type?: string
          status?: string | null
          teams?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      user_offers: {
        Row: {
          claimed_at: string
          id: string
          offer_id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          offer_id: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          offer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_offers_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

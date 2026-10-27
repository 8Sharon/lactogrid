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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          severity: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          severity?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          severity?: string
          title?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          category: string
          description: string
          id: number
          sort: number
          title: string
        }
        Insert: {
          category: string
          description?: string
          id?: never
          sort?: number
          title: string
        }
        Update: {
          category?: string
          description?: string
          id?: never
          sort?: number
          title?: string
        }
        Relationships: []
      }
      daily_metrics: {
        Row: {
          avg_temp_c: number
          battery_kwh: number
          chilled_l: number
          collected_l: number
          consumption_kwh: number
          energy_cost_per_litre: number
          grid_kwh: number
          metric_date: string
          rejection_rate: number
          revenue_ksh: number
          solar_kwh: number
        }
        Insert: {
          avg_temp_c?: number
          battery_kwh?: number
          chilled_l?: number
          collected_l?: number
          consumption_kwh?: number
          energy_cost_per_litre?: number
          grid_kwh?: number
          metric_date: string
          rejection_rate?: number
          revenue_ksh?: number
          solar_kwh?: number
        }
        Update: {
          avg_temp_c?: number
          battery_kwh?: number
          chilled_l?: number
          collected_l?: number
          consumption_kwh?: number
          energy_cost_per_litre?: number
          grid_kwh?: number
          metric_date?: string
          rejection_rate?: number
          revenue_ksh?: number
          solar_kwh?: number
        }
        Relationships: []
      }
      energy_current: {
        Row: {
          battery_cycles: number
          battery_kwh: number
          battery_pct: number
          cooling_kw: number
          id: number
          lighting_kw: number
          pump_kw: number
          recommendation: string
          solar_kw: number
          total_consumption_kwh: number
          total_generation_kwh: number
          updated_at: string
        }
        Insert: {
          battery_cycles?: number
          battery_kwh?: number
          battery_pct?: number
          cooling_kw?: number
          id?: number
          lighting_kw?: number
          pump_kw?: number
          recommendation?: string
          solar_kw?: number
          total_consumption_kwh?: number
          total_generation_kwh?: number
          updated_at?: string
        }
        Update: {
          battery_cycles?: number
          battery_kwh?: number
          battery_pct?: number
          cooling_kw?: number
          id?: number
          lighting_kw?: number
          pump_kw?: number
          recommendation?: string
          solar_kw?: number
          total_consumption_kwh?: number
          total_generation_kwh?: number
          updated_at?: string
        }
        Relationships: []
      }
      farmers: {
        Row: {
          balance: number
          created_at: string
          full_name: string
          id: string
          joined_at: string
          phone: string
          status: string
        }
        Insert: {
          balance?: number
          created_at?: string
          full_name: string
          id?: string
          joined_at?: string
          phone?: string
          status?: string
        }
        Update: {
          balance?: number
          created_at?: string
          full_name?: string
          id?: string
          joined_at?: string
          phone?: string
          status?: string
        }
        Relationships: []
      }
      hourly_forecast: {
        Row: {
          expected_load_kw: number
          generation_kw: number
          hour: number
        }
        Insert: {
          expected_load_kw?: number
          generation_kw?: number
          hour: number
        }
        Update: {
          expected_load_kw?: number
          generation_kw?: number
          hour?: number
        }
        Relationships: []
      }
      insights: {
        Row: {
          icon: string
          id: number
          sort: number
          text: string
        }
        Insert: {
          icon?: string
          id?: never
          sort?: number
          text: string
        }
        Update: {
          icon?: string
          id?: never
          sort?: number
          text?: string
        }
        Relationships: []
      }
      milk_collections: {
        Row: {
          collected_at: string
          farmer_id: string
          id: string
          quality: string
          temp_c: number
          volume_l: number
        }
        Insert: {
          collected_at?: string
          farmer_id: string
          id?: string
          quality?: string
          temp_c: number
          volume_l: number
        }
        Update: {
          collected_at?: string
          farmer_id?: string
          id?: string
          quality?: string
          temp_c?: number
          volume_l?: number
        }
        Relationships: [
          {
            foreignKeyName: "milk_collections_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cooperative_location: string
          cooperative_name: string
          created_at: string
          full_name: string
          id: string
          job_title: string | null
          phone: string | null
        }
        Insert: {
          cooperative_location?: string
          cooperative_name?: string
          created_at?: string
          full_name?: string
          id: string
          job_title?: string | null
          phone?: string | null
        }
        Update: {
          cooperative_location?: string
          cooperative_name?: string
          created_at?: string
          full_name?: string
          id?: string
          job_title?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      system_devices: {
        Row: {
          detail: string
          icon: string
          id: number
          name: string
          sort: number
          status: string
        }
        Insert: {
          detail?: string
          icon?: string
          id?: never
          name: string
          sort?: number
          status: string
        }
        Update: {
          detail?: string
          icon?: string
          id?: never
          name?: string
          sort?: number
          status?: string
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
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

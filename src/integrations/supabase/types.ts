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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      banner_images: {
        Row: {
          brand: string
          category_id: string | null
          created_at: string | null
          description: string | null
          desktop_crop: Json | null
          desktop_image_url: string | null
          id: string
          image_url: string
          is_active: boolean | null
          mobile_crop: Json | null
          mobile_image_url: string | null
          product_id: string | null
          sort_order: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          brand: string
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          desktop_crop?: Json | null
          desktop_image_url?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          mobile_crop?: Json | null
          mobile_image_url?: string | null
          product_id?: string | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          desktop_crop?: Json | null
          desktop_image_url?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          mobile_crop?: Json | null
          mobile_image_url?: string | null
          product_id?: string | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_images_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banner_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_inquiries: {
        Row: {
          admin_notes: string | null
          company_name: string
          contact_name: string
          created_at: string | null
          email: string
          estimated_quantity: string
          id: string
          message: string | null
          phone: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          company_name: string
          contact_name: string
          created_at?: string | null
          email: string
          estimated_quantity: string
          id?: string
          message?: string | null
          phone: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string | null
          email?: string
          estimated_quantity?: string
          id?: string
          message?: string | null
          phone?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          size: number
          updated_at: string | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          size: number
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          size?: number
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          brand: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          path: string
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          path: string
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          path?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      featured_products: {
        Row: {
          brand: string
          created_at: string | null
          id: string
          is_active: boolean | null
          product_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          brand: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
          size: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          quantity: number
          size: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
          size?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          awb_code: string | null
          billing_address: Json | null
          cod_amount: number | null
          cod_collected: boolean | null
          courier_company_id: number | null
          courier_name: string | null
          created_at: string | null
          estimated_delivery_date: string | null
          id: string
          payment_id: string | null
          payment_method: string | null
          pickup_token: string | null
          razorpay_order_id: string | null
          return_awb_code: string | null
          shipment_id: number | null
          shipping_address: Json | null
          shipping_charges: number | null
          shiprocket_order_id: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          tracking_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          awb_code?: string | null
          billing_address?: Json | null
          cod_amount?: number | null
          cod_collected?: boolean | null
          courier_company_id?: number | null
          courier_name?: string | null
          created_at?: string | null
          estimated_delivery_date?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          pickup_token?: string | null
          razorpay_order_id?: string | null
          return_awb_code?: string | null
          shipment_id?: number | null
          shipping_address?: Json | null
          shipping_charges?: number | null
          shiprocket_order_id?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          tracking_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          awb_code?: string | null
          billing_address?: Json | null
          cod_amount?: number | null
          cod_collected?: boolean | null
          courier_company_id?: number | null
          courier_name?: string | null
          created_at?: string | null
          estimated_delivery_date?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          pickup_token?: string | null
          razorpay_order_id?: string | null
          return_awb_code?: string | null
          shipment_id?: number | null
          shipping_address?: Json | null
          shipping_charges?: number | null
          shiprocket_order_id?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          tracking_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
          sort_order: number | null
          variant_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
          sort_order?: number | null
          variant_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
          sort_order?: number | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default_color: boolean | null
          product_id: string
          sku: string | null
          stock_quantity: number | null
        }
        Insert: {
          color_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default_color?: boolean | null
          product_id: string
          sku?: string | null
          stock_quantity?: number | null
        }
        Update: {
          color_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default_color?: boolean | null
          product_id?: string
          sku?: string | null
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: Database["public"]["Enums"]["brand_type"]
          category: string
          created_at: string | null
          default_variant_id: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          price: number
          sizes: number[] | null
          sku: string | null
          stock_quantity: number
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          brand: Database["public"]["Enums"]["brand_type"]
          category: string
          created_at?: string | null
          default_variant_id?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          price: number
          sizes?: number[] | null
          sku?: string | null
          stock_quantity?: number
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          brand?: Database["public"]["Enums"]["brand_type"]
          category?: string
          created_at?: string | null
          default_variant_id?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          price?: number
          sizes?: number[] | null
          sku?: string | null
          stock_quantity?: number
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_default_variant_id_fkey"
            columns: ["default_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shipping_tracking: {
        Row: {
          activity: string | null
          activity_date: string | null
          awb_code: string | null
          created_at: string | null
          id: string
          location: string | null
          order_id: string | null
          tracking_status: string | null
        }
        Insert: {
          activity?: string | null
          activity_date?: string | null
          awb_code?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          order_id?: string | null
          tracking_status?: string | null
        }
        Update: {
          activity?: string | null
          activity_date?: string | null
          awb_code?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          order_id?: string | null
          tracking_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          address: string | null
          allow_registration: boolean | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          currency: string | null
          email_notifications: boolean | null
          id: string
          low_stock_threshold: number | null
          maintenance_mode: boolean | null
          order_notifications: boolean | null
          site_description: string | null
          site_name: string | null
          social_media: Json | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          allow_registration?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string | null
          email_notifications?: boolean | null
          id?: string
          low_stock_threshold?: number | null
          maintenance_mode?: boolean | null
          order_notifications?: boolean | null
          site_description?: string | null
          site_name?: string | null
          social_media?: Json | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          allow_registration?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string | null
          email_notifications?: boolean | null
          id?: string
          low_stock_threshold?: number | null
          maintenance_mode?: boolean | null
          order_notifications?: boolean | null
          site_description?: string | null
          site_name?: string | null
          social_media?: Json | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_product_with_default_variant: {
        Args: { product_data: Json }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      brand_type: "bhyross" | "deecodes" | "imcolus"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "return_initiated"
        | "returned"
      shoe_category: "oxford" | "derby" | "monk-strap" | "loafer"
      user_role: "customer" | "admin" | "super_admin"
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
      brand_type: ["bhyross", "deecodes", "imcolus"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "return_initiated",
        "returned",
      ],
      shoe_category: ["oxford", "derby", "monk-strap", "loafer"],
      user_role: ["customer", "admin", "super_admin"],
    },
  },
} as const

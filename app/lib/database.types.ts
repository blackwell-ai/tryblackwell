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
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          customer_id: string
          id: string
          is_default: boolean
          line1: string
          line2: string | null
          phone: string | null
          postal_code: string | null
          recipient_name: string | null
          region: string | null
          type: Database["public"]["Enums"]["address_type"]
          updated_at: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean
          line1: string
          line2?: string | null
          phone?: string | null
          postal_code?: string | null
          recipient_name?: string | null
          region?: string | null
          type: Database["public"]["Enums"]["address_type"]
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean
          line1?: string
          line2?: string | null
          phone?: string | null
          postal_code?: string | null
          recipient_name?: string | null
          region?: string | null
          type?: Database["public"]["Enums"]["address_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          marketing_consent: boolean
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          marketing_consent?: boolean
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          marketing_consent?: boolean
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          memo: string | null
          occurred_at: string
          order_id: string | null
          stripe_reference: string | null
          supplier_id: string | null
          type: Database["public"]["Enums"]["txn_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          memo?: string | null
          occurred_at?: string
          order_id?: string | null
          stripe_reference?: string | null
          supplier_id?: string | null
          type: Database["public"]["Enums"]["txn_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          memo?: string | null
          occurred_at?: string
          order_id?: string | null
          stripe_reference?: string | null
          supplier_id?: string | null
          type?: Database["public"]["Enums"]["txn_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          available: number | null
          on_hand: number
          reorder_point: number
          reorder_quantity: number
          reserved: number
          safety_stock: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          available?: number | null
          on_hand?: number
          reorder_point?: number
          reorder_quantity?: number
          reserved?: number
          safety_stock?: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          available?: number | null
          on_hand?: number
          reorder_point?: number
          reorder_quantity?: number
          reserved?: number
          safety_stock?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "storefront_catalog"
            referencedColumns: ["variant_id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          currency: string
          id: string
          line_total_amount: number
          order_id: string
          product_name: string
          quantity: number
          sku: string
          unit_cost_amount: number | null
          unit_price_amount: number
          updated_at: string
          variant_id: string | null
          variant_label: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          line_total_amount: number
          order_id: string
          product_name: string
          quantity: number
          sku: string
          unit_cost_amount?: number | null
          unit_price_amount: number
          updated_at?: string
          variant_id?: string | null
          variant_label?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          line_total_amount?: number
          order_id?: string
          product_name?: string
          quantity?: number
          sku?: string
          unit_cost_amount?: number | null
          unit_price_amount?: number
          updated_at?: string
          variant_id?: string | null
          variant_label?: string | null
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
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "storefront_catalog"
            referencedColumns: ["variant_id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_id: string | null
          discount_amount: number
          email: string
          id: string
          order_number: string
          placed_at: string | null
          shipping_address: Json | null
          shipping_amount: number
          status: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          discount_amount?: number
          email: string
          id?: string
          order_number?: string
          placed_at?: string | null
          shipping_address?: Json | null
          shipping_amount?: number
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          discount_amount?: number
          email?: string
          id?: string
          order_number?: string
          placed_at?: string | null
          shipping_address?: Json | null
          shipping_amount?: number
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          fit: Database["public"]["Enums"]["fit_type"] | null
          id: string
          kind: Database["public"]["Enums"]["image_kind"]
          position: number
          product_id: string
          updated_at: string
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          fit?: Database["public"]["Enums"]["fit_type"] | null
          id?: string
          kind: Database["public"]["Enums"]["image_kind"]
          position?: number
          product_id: string
          updated_at?: string
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          fit?: Database["public"]["Enums"]["fit_type"] | null
          id?: string
          kind?: Database["public"]["Enums"]["image_kind"]
          position?: number
          product_id?: string
          updated_at?: string
          url?: string
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
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_catalog"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          description: string | null
          handle: string
          id: string
          name: string
          position: number | null
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          handle: string
          id?: string
          name: string
          position?: number | null
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          handle?: string
          id?: string
          name?: string
          position?: number | null
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          bucket: string
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          order_id: string | null
          qty_delta: number
          type: Database["public"]["Enums"]["stock_movement_type"]
          variant_id: string
        }
        Insert: {
          bucket: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id?: string | null
          qty_delta: number
          type: Database["public"]["Enums"]["stock_movement_type"]
          variant_id: string
        }
        Update: {
          bucket?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id?: string | null
          qty_delta?: number
          type?: Database["public"]["Enums"]["stock_movement_type"]
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_order_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "storefront_catalog"
            referencedColumns: ["variant_id"]
          },
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          created_at: string
          id: string
          lead_time_days: number | null
          name: string
          note: string | null
          status: Database["public"]["Enums"]["supplier_status"]
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          lead_time_days?: number | null
          name: string
          note?: string | null
          status?: Database["public"]["Enums"]["supplier_status"]
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          lead_time_days?: number | null
          name?: string
          note?: string | null
          status?: Database["public"]["Enums"]["supplier_status"]
          updated_at?: string
        }
        Relationships: []
      }
      variant_costs: {
        Row: {
          created_at: string
          currency: string
          effective_from: string
          id: string
          note: string | null
          source: string | null
          unit_cost_amount: number
          variant_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          effective_from?: string
          id?: string
          note?: string | null
          source?: string | null
          unit_cost_amount: number
          variant_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          effective_from?: string
          id?: string
          note?: string | null
          source?: string | null
          unit_cost_amount?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_costs_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "storefront_catalog"
            referencedColumns: ["variant_id"]
          },
          {
            foreignKeyName: "variant_costs_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      variants: {
        Row: {
          barcode: string | null
          created_at: string
          currency: string
          default_supplier_id: string | null
          fit: Database["public"]["Enums"]["fit_type"]
          height_mm: number | null
          id: string
          length_mm: number | null
          position: number | null
          price_amount: number | null
          product_id: string
          size: string
          sku: string
          status: Database["public"]["Enums"]["variant_status"]
          updated_at: string
          weight_grams: number | null
          width_mm: number | null
        }
        Insert: {
          barcode?: string | null
          created_at?: string
          currency?: string
          default_supplier_id?: string | null
          fit: Database["public"]["Enums"]["fit_type"]
          height_mm?: number | null
          id?: string
          length_mm?: number | null
          position?: number | null
          price_amount?: number | null
          product_id: string
          size: string
          sku: string
          status?: Database["public"]["Enums"]["variant_status"]
          updated_at?: string
          weight_grams?: number | null
          width_mm?: number | null
        }
        Update: {
          barcode?: string | null
          created_at?: string
          currency?: string
          default_supplier_id?: string | null
          fit?: Database["public"]["Enums"]["fit_type"]
          height_mm?: number | null
          id?: string
          length_mm?: number | null
          position?: number | null
          price_amount?: number | null
          product_id?: string
          size?: string
          sku?: string
          status?: Database["public"]["Enums"]["variant_status"]
          updated_at?: string
          weight_grams?: number | null
          width_mm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "variants_default_supplier_id_fkey"
            columns: ["default_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_catalog"
            referencedColumns: ["product_id"]
          },
        ]
      }
    }
    Views: {
      product_availability: {
        Row: {
          in_stock: boolean | null
          variant_id: string | null
        }
        Insert: {
          in_stock?: never
          variant_id?: string | null
        }
        Update: {
          in_stock?: never
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "storefront_catalog"
            referencedColumns: ["variant_id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      storefront_catalog: {
        Row: {
          category: Database["public"]["Enums"]["product_category"] | null
          currency: string | null
          description: string | null
          fit: Database["public"]["Enums"]["fit_type"] | null
          handle: string | null
          name: string | null
          price_amount: number | null
          product_id: string | null
          product_position: number | null
          size: string | null
          sku: string | null
          variant_id: string | null
          variant_position: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      address_type: "shipping" | "billing"
      fit_type: "Men" | "Women" | "Unisex"
      image_kind: "front" | "back" | "model" | "detail"
      order_status:
        | "pending"
        | "paid"
        | "fulfilled"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
      product_category: "tops" | "layers" | "bottoms" | "accessory"
      product_status: "draft" | "active" | "archived"
      stock_movement_type:
        | "restock"
        | "sale"
        | "return"
        | "adjustment"
        | "reservation"
        | "release"
        | "shrinkage"
      supplier_status: "active" | "archived"
      txn_type:
        | "order_revenue"
        | "refund"
        | "stripe_fee"
        | "shipping_cost"
        | "supplier_payment"
        | "payout"
        | "tax_remittance"
        | "adjustment"
      variant_status: "active" | "archived"
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
      address_type: ["shipping", "billing"],
      fit_type: ["Men", "Women", "Unisex"],
      image_kind: ["front", "back", "model", "detail"],
      order_status: [
        "pending",
        "paid",
        "fulfilled",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      product_category: ["tops", "layers", "bottoms", "accessory"],
      product_status: ["draft", "active", "archived"],
      stock_movement_type: [
        "restock",
        "sale",
        "return",
        "adjustment",
        "reservation",
        "release",
        "shrinkage",
      ],
      supplier_status: ["active", "archived"],
      txn_type: [
        "order_revenue",
        "refund",
        "stripe_fee",
        "shipping_cost",
        "supplier_payment",
        "payout",
        "tax_remittance",
        "adjustment",
      ],
      variant_status: ["active", "archived"],
    },
  },
} as const


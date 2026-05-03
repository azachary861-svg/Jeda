export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      packages: {
        Row: {
          id: string;
          region_id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          destination: string;
          duration_days: number;
          base_price: number;
          min_pax: number;
          max_pax: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['packages']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['packages']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          booking_code: string;
          client_id: string;
          package_id: string;
          region_id: string;
          trip_date: string;
          pickup_time: string;
          pickup_location: string;
          pax_count: number;
          base_price: number;
          price_multiplier: number;
          total_price: number;
          service_fee: number;
          photographer_fee: number;
          grand_total: number;
          status: string;
          payment_status: string;
          add_photographer: boolean;
          trip_status: string | null;
          midtrans_order_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['bookings']['Row']>;
        Update: Partial<Database['public']['Tables']['bookings']['Row']>;
      };
    };
    Views: never;
    Functions: {
      calculate_booking_price: {
        Args: {
          p_package_id: string;
          p_trip_date: string;
          p_pax_count: number;
          p_add_photographer?: boolean;
        };
        Returns: {
          base_price: number;
          multiplier: number;
          photographer_fee: number;
          service_fee: number;
          grand_total: number;
          applied_rule: string;
        }[];
      };
    };
    Enums: never;
    CompositeTypes: never;
  };
};

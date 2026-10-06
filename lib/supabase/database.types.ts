export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  lexicon_polycraft_app: {
    Tables: {
      products: {
        Row: {
          id: string;
          code: string;
          name: string;
          category: string;
          fsn: 'Runner' | 'Repeater' | 'Stranger';
          packaging_type: 'set' | 'bundle' | 'inner' | 'loose';
          pack_size: number;
          min_stock: number;
          max_stock: number;
          stock: number;
          photo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          category: string;
          fsn?: 'Runner' | 'Repeater' | 'Stranger';
          packaging_type?: 'set' | 'bundle' | 'inner' | 'loose';
          pack_size?: number;
          min_stock?: number;
          max_stock?: number;
          stock?: number;
          photo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          category?: string;
          fsn?: 'Runner' | 'Repeater' | 'Stranger';
          packaging_type?: 'set' | 'bundle' | 'inner' | 'loose';
          pack_size?: number;
          min_stock?: number;
          max_stock?: number;
          stock?: number;
          photo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          product_id: string | null;
          code: string;
          name: string;
          type: 'production' | 'delivery' | 'physical_audit';
          change: number;
          new_stock: number;
          remarks: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          code: string;
          name: string;
          type: 'production' | 'delivery' | 'physical_audit';
          change: number;
          new_stock: number;
          remarks?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          code?: string;
          name?: string;
          type?: 'production' | 'delivery' | 'physical_audit';
          change?: number;
          new_stock?: number;
          remarks?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      round_verifications: {
        Row: {
          id: string;
          product_id: string;
          verified: boolean;
          verified_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          verified?: boolean;
          verified_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          verified?: boolean;
          verified_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "round_verifications_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: true;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

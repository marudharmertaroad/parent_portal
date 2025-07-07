import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lrsffguycbuvzrjzevsm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing');

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is missing from environment variables');
  throw new Error('Missing Supabase URL. Please check your .env file.');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing from environment variables');
  console.error('📝 Please add VITE_SUPABASE_ANON_KEY to your .env file');
  console.error('🔗 Get your anon key from: https://supabase.com/dashboard/project/lrsffguycbuvzrjzevsm/settings/api');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || '');

// Test connection on initialization
if (supabaseAnonKey) {
  supabase.from('students').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase connection failed:', error.message);
        console.error('🔍 Please check:');
        console.error('  - Your Supabase anon key is correct');
        console.error('  - Database tables exist');
        console.error('  - RLS policies are configured');
      } else {
        console.log('✅ Supabase connected successfully');
      }
    })
    .catch(err => {
      console.error('❌ Supabase connection error:', err);
    });
} else {
  console.warn('⚠️ Skipping connection test - no anon key provided');
}

// Database Types
export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: number;
          sr_no: string;
          name: string;
          class: string;
          nic_student_id: string;
          medium: string | null;
          father_name: string;
          mother_name: string | null;
          gender: string | null;
          dob: string | null;
          contact: string;
          address: string | null;
          bus_route: string | null;
          religion: string | null;
          created_at: string;
          updated_at: string;
          is_rte: boolean;
          status: string | null;
        };
      };
      fee_records: {
        Row: {
          id: number;
          student_id: string;
          class: string | null;
          total_fees: number;
          paid_fees: number;
          pending_fees: number;
          discount_fees: number | null;
          bus_fees: number | null;
          turnover: number | null;
          discount_given_by: string | null;
          due_date: string;
          last_payment_date: string | null;
          created_at: string | null;
          updated_at: string | null;
          status: string;
          student_name: string | null;
          student_primary_id: number | null;
        };
      };
      exam_records: {
        Row: {
          id: number;
          student_id: string;
          exam_type: string;
          exam_date: string;
          total_marks: number;
          obtained_marks: number;
          percentage: number;
          grade: string | null;
          created_at: string | null;
          updated_at: string | null;
          student_primary_id: number | null;
        };
      };
      subject_marks: {
        Row: {
          id: number;
          exam_record_id: number;
          subject: string;
          max_marks: number;
          obtained_marks: number;
          grade: string | null;
        };
      };
      payment_history: {
        Row: {
          id: number;
          fee_record_id: number;
          amount: number;
          payment_date: string;
        };
      };
    };
    Functions: {
      authenticate_student: {
        Args: {
          p_sr_no: string;
          p_class: string;
        };
        Returns: {
          student_id: number;
          student_data: any;
          success: boolean;
          message: string;
        }[];
      };
      get_student_fees: {
        Args: {
          p_student_id: number;
        };
        Returns: any[];
      };
      get_student_exams: {
        Args: {
          p_student_id: number;
        };
        Returns: any[];
      };
      process_fee_payment: {
        Args: {
          p_fee_record_id: number;
          p_amount: number;
          p_payment_method?: string;
        };
        Returns: {
          success: boolean;
          transaction_id: string;
          message: string;
        }[];
      };
    };
  };
}
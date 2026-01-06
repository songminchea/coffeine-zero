// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// .env.local에 저장한 정보를 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 범용적으로 사용할 수 있는 Supabase 클라이언트를 생성합니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
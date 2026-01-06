// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// 브라우저에서 사용할 Supabase 클라이언트를 생성합니다.
export const supabase = createClientComponentClient();
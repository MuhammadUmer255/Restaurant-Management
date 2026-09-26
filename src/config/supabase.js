import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lccdghpxhhxmhiaqtnlo.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ihCxzTx-I7qLGPkIPvc51Q_0vjFIv3H';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
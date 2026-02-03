import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wuognqodqynqxgmmhmav.supabase.co";

const supabaseAnonymKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonymKey);

export default supabase;

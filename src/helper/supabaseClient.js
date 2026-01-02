import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wuognqodqynqxgmmhmav.supabase.co";

// DONT FORGET TO ADD .ENV FILE AND MAKE THIS ANON
const supabaseAnonymKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1b2ducW9kcXlucXhnbW1obWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTA1NzksImV4cCI6MjA4MTQ2NjU3OX0.XCz57604NE4VNXSTM4G3kzNyQgoF0JKnv7xpFbjuGJc";

const supabase = createClient(supabaseUrl, supabaseAnonymKey);

export default supabase;


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlgsxdognoavpqtzmvhq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZ3N4ZG9nbm9hdnBxdHptdmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Mzg2NTAsImV4cCI6MjA3OTQxNDY1MH0.BDMQ3JqMd0CB9JmyCU2RHW4ypgOH6pk8NpWrE7NBJMk';

export const supabase = createClient(supabaseUrl, supabaseKey);

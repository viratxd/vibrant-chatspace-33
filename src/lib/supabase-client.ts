
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jwiahecqmbelrupcaxlp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aWFoZWNxbWJlbHJ1cGNheGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MTA5NzksImV4cCI6MjA1NTM4Njk3OX0.0eUiYLib9vuBFQ5lvcbkfLV9uQlafjaK79dnZEbCihs';

export const supabase = createClient(supabaseUrl, supabaseKey);

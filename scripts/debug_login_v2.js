
import { createClient } from '@supabase/supabase-js';

import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const email = process.env.DEBUG_EMAIL || 'admin@example.com';
const password = process.env.DEBUG_PASSWORD || 'password123';

async function debugLogin() {
    console.log('Attempting to sign in...');

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Login Failed via Auth:', error.message);
        return;
    }

    console.log('Auth Login Successful!');
    console.log('User ID:', data.user.id);

    console.log('Checking admin_users table...');
    const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', data.user.id);

    if (adminError) {
        console.log('Error querying admin_users:');
        console.log(JSON.stringify(adminError, null, 2));
    } else {
        console.log('Admin Data:', adminData);
    }
}

debugLogin();

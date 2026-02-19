
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhcajmcdhovwuhxgnbes.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoY2FqbWNkaG92d3VoeGduYmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODU2NDUsImV4cCI6MjA4MDc2MTY0NX0.euXpGasVgGQ2Qr7GxgeWx9-3GeAlpopjVpeHQDRZPCk';

const supabase = createClient(supabaseUrl, supabaseKey);

const email = 'grampanchayat023@gmail.com';
const password = 'grampanchayat_admin';

async function debugLogin() {
    console.log('Attempting to sign in...');

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Login Failed via Auth:', error.message);
        if (error.message.includes('Email not confirmed')) {
            console.log('ISSUE IDENTIFIED: Email is not confirmed.');
        }
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
        console.error('Error querying admin_users:', adminError.message);
    } else if (!adminData || adminData.length === 0) {
        console.error('User authenticated but NOT found in admin_users table.');
    } else {
        console.log('User found in admin_users:', adminData[0]);
        console.log('Login should work.');
    }
}

debugLogin();

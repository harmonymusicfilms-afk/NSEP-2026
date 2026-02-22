import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdmin() {
    const email = 'grampanchayat023@gmail.com';
    const password = process.argv[2] || 'Admin@12345'; // Use argument or default

    console.log(`Creating super admin: ${email} with password: ${password}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Auth error:', authError.message);
        return;
    }

    if (authData.user) {
        console.log('User created in Auth:', authData.user.id);

        // Now insert into admin_users (skip if RLS prevents anon insert, we could need service_role)
        const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .insert([
                {
                    id: authData.user.id,
                    name: 'Super Admin',
                    email,
                    role: 'SUPER_ADMIN'
                }
            ]);

        if (adminError) {
            console.error('Error adding to admin_users:', adminError.message);
        } else {
            console.log('Successfully created admin user!');
        }
    }
}

createAdmin();

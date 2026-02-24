
import { createClient } from '@insforge/sdk';

const supabaseUrl = "https://z7m852zi.us-east.insforge.app";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzM2MDB9.GqOHtEEA7Z7M6GZ8QanaertJ_ng8y9hEa6rqWwU4XF4";

const backend = createClient(supabaseUrl, supabaseKey);

async function run() {
    const email = "grampanchayat023@gmail.com";
    // From src/stores/index.ts line 381
    const password = "grampanchayat_admin";

    console.log(`Attempting to sign up ${email}...`);

    const { data, error } = await backend.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: 'SUPER_ADMIN',
                full_name: 'Gram Panchayat Admin'
            }
        }
    });

    if (error) {
        console.error("Signup error:", error.message);
        if (error.message.includes("already registered")) {
            console.log("User already exists, proceeding to table insert...");
        } else {
            process.exit(1);
        }
    } else {
        console.log("Signup successful:", data.user.id);
    }

    // Now insert into public.admin_users
    // We need to get the user ID if we didn't just get it
    let userId = data?.user?.id;

    if (!userId) {
        // Try to find it via SQL or another way if it already existed
        console.log("Fetching user ID for existing user...");
    }

    console.log("Please run the SQL insert manually if signup succeeded.");
}

run();

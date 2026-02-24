
import { createClient } from '@insforge/sdk';

const supabaseUrl = "https://z7m852zi.us-east.insforge.app";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzM2MDB9.GqOHtEEA7Z7M6GZ8QanaertJ_ng8y9hEa6rqWwU4XF4";

// Correct syntax based on src/lib/backend.ts
const insforge = createClient({
    baseUrl: supabaseUrl,
    anonKey: supabaseKey
});

async function run() {
    const email = "grampanchayat023@gmail.com";
    const password = "grampanchayat_admin";

    console.log(`Attempting to sign up ${email}...`);

    try {
        const { data, error } = await insforge.auth.signUp({
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
        } else {
            console.log("Signup successful! User ID:", data.user.id);
        }
    } catch (err) {
        console.error("Exec error:", err);
    }
}

run();

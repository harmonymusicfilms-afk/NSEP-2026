import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    console.log("Signing in...");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'grampanchayat023@gmail.com',
        password: 'admin123'
    });
    console.log("Sign in error:", signInError ? signInError.message : "Success");

    if (signInError) {
        console.log("Signing up...");
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'grampanchayat023@gmail.com',
            password: 'admin123'
        });
        console.log("Sign up error:", signUpError ? signUpError.message : "Success");
        console.log("Sign up session:", signUpData.session);
    }
}
test();

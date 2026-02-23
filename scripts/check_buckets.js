import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

// NOTE: Anon key cannot create buckets by default. We might need service role key. 
// But let's try calling storage functions directly. If it fails, we will fallback to 
// 'student-photos' bucket which we know exists from RegisterPage!

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateBuckets() {
    const bucketsToCheck = ['gallery', 'center-documents', 'student-photos'];

    for (const b of bucketsToCheck) {
        const { data, error } = await supabase.storage.getBucket(b);
        if (error && error.message.includes('The resource was not found')) {
            console.log(`Bucket ${b} not found. Attempting to create...`);
            const { data: createData, error: createError } = await supabase.storage.createBucket(b, {
                public: true,
                fileSizeLimit: 10485760 // 10MB
            });
            if (createError) {
                console.error(`Failed to create bucket ${b}:`, createError.message);
            } else {
                console.log(`Created bucket ${b} successfully!`);
            }
        } else if (data) {
            console.log(`Bucket ${b} exists.`);
        } else {
            console.error(`Error checking bucket ${b}:`, error?.message);
        }
    }
}

checkAndCreateBuckets();

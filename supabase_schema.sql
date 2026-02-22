-- NSEP (National Standard Examination in Physics) Database Schema
-- Supabase / PostgreSQL

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Students Table
create table if not exists public.students (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    father_name text not null,
    class_level integer not null,
    mobile text not null unique,
    email text not null unique,
    school_name text not null,
    school_contact text not null,
    address_village text not null,
    address_block text not null,
    address_tahsil text not null,
    address_district text not null,
    address_state text not null,
    photo_url text,
    center_code text unique not null,
    referral_code text unique,
    referred_by_center_code text,
    referred_by_student text,
    status text not null default 'PENDING' check (status in ('ACTIVE', 'BLOCKED', 'PENDING')),
    mobile_verified boolean default false,
    email_verified boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Centers Table
create table if not exists public.centers (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    owner_name text not null,
    email text not null unique,
    phone text not null unique,
    address text not null,
    state text not null,
    district text not null,
    center_code text unique not null,
    status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'BLOCKED')),
    approved_by uuid,
    approved_at timestamptz,
    total_students integer default 0,
    total_earnings decimal(10, 2) default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. Admin Users Table
create table if not exists public.admin_users (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    email text not null unique,
    role text not null default 'MODERATOR' check (role in ('SUPER_ADMIN', 'ADMIN', 'MODERATOR')),
    created_at timestamptz default now(),
    last_login timestamptz,
    updated_at timestamptz default now()
);

-- 4. Payments Table
create table if not exists public.payments (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    razorpay_order_id text not null,
    razorpay_payment_id text,
    razorpay_signature text,
    amount decimal(10, 2) not null,
    status text not null default 'PENDING' check (status in ('PENDING', 'SUCCESS', 'FAILED')),
    paid_at timestamptz,
    created_at timestamptz default now()
);

-- 5. Wallets Table
create table if not exists public.wallets (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade unique not null,
    balance decimal(10, 2) default 0 not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 6. Wallet Transactions Table
create table if not exists public.wallet_transactions (
    id uuid default uuid_generate_v4() primary key,
    wallet_id uuid references public.wallets(id) on delete cascade not null,
    type text not null check (type in ('CENTER_REWARD', 'SCHOLARSHIP_CREDIT', 'ADMIN_ADJUSTMENT', 'WITHDRAWAL')),
    amount decimal(10, 2) not null,
    reason text not null,
    reference_id text,
    created_at timestamptz default now()
);

-- 7. Exam Questions Table
create table if not exists public.exam_questions (
    id uuid default uuid_generate_v4() primary key,
    class_level integer not null,
    question_text text not null,
    options text[] not null, -- Array of strings for options
    correct_option_index integer not null,
    subject text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 8. Exam Sessions Table
create table if not exists public.exam_sessions (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    class_level integer not null,
    started_at timestamptz default now(),
    current_question_index integer default 0,
    answers jsonb default '[]'::jsonb, -- Store answers as JSONB array
    status text not null default 'IN_PROGRESS' check (status in ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    total_time_spent integer default 0,
    created_at timestamptz default now()
);

-- 9. Exam Results Table
create table if not exists public.exam_results (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    class_level integer not null,
    total_score integer not null,
    correct_count integer not null,
    wrong_count integer not null,
    unanswered_count integer not null,
    total_time_taken integer not null,
    rank integer,
    result_status text not null default 'PENDING' check (result_status in ('PENDING', 'PUBLISHED')),
    created_at timestamptz default now()
);

-- 10. Scholarships Table
create table if not exists public.scholarships (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    class_level integer not null,
    rank integer not null,
    scholarship_type text not null check (scholarship_type in ('AMOUNT', 'CERTIFICATE', 'BOTH')),
    amount decimal(10, 2),
    approval_status text not null default 'PENDING' check (approval_status in ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by uuid references auth.users(id),
    approved_at timestamptz,
    rejection_reason text,
    created_at timestamptz default now()
);

-- 11. Certificates Table
create table if not exists public.certificates (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    exam_result_id uuid references public.exam_results(id) on delete cascade not null,
    certificate_id_display text unique not null, -- The readable ID (e.g., NSEP-2024-XXXX)
    certificate_type text not null check (certificate_type in ('PARTICIPATION', 'MERIT', 'SCHOLARSHIP')),
    pdf_url text,
    qr_code_url text not null,
    issued_at timestamptz default now(),
    is_valid boolean default true,
    created_at timestamptz default now()
);

-- 12. Referral Codes Table
create table if not exists public.referral_codes (
    id uuid default uuid_generate_v4() primary key,
    code text unique not null,
    type text not null check (type in ('ADMIN_CENTER', 'CENTER_CODE')),
    owner_id uuid not null, -- Student ID (for center code) or Admin ID
    owner_name text not null,
    reward_amount decimal(10, 2) not null,
    is_active boolean default true,
    total_referrals integer default 0,
    total_earnings decimal(10, 2) default 0,
    created_at timestamptz default now(),
    created_by uuid references auth.users(id)
);

-- 13. Referral Logs Table
create table if not exists public.referral_logs (
    id uuid default uuid_generate_v4() primary key,
    referral_code_id uuid references public.referral_codes(id) on delete cascade not null,
    referral_code text not null,
    referrer_id uuid not null,
    referrer_role text not null check (referrer_role in ('ADMIN', 'CENTER')),
    new_user_id uuid references public.students(id),
    new_user_name text not null,
    amount decimal(10, 2) not null,
    status text not null default 'PENDING' check (status in ('PENDING', 'CREDITED', 'BLOCKED')),
    ip_address text,
    created_at timestamptz default now()
);

-- 14. Center Rewards Table
create table if not exists public.center_rewards (
    id uuid default uuid_generate_v4() primary key,
    center_owner_student_id uuid references public.students(id) on delete cascade not null,
    new_student_id uuid references public.students(id) on delete cascade not null,
    payment_id uuid references public.payments(id) on delete cascade not null,
    reward_amount decimal(10, 2) not null,
    status text not null default 'PENDING' check (status in ('PENDING', 'CREDITED', 'FAILED')),
    created_at timestamptz default now()
);

-- 15. Consent Logs Table
create table if not exists public.consent_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid not null, -- Student or Center ID
    user_type text not null check (user_type in ('STUDENT', 'CENTER')),
    ip_address text not null,
    policy_version text not null,
    terms_accepted boolean default false,
    privacy_accepted boolean default false,
    referral_policy_accepted boolean default false,
    consented_at timestamptz default now()
);

-- 16. Contact Submissions Table
create table if not exists public.contact_submissions (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    email text not null,
    phone text not null,
    subject text not null,
    message text not null,
    status text not null default 'NEW' check (status in ('NEW', 'READ', 'REPLIED')),
    replied_at timestamptz,
    replied_by uuid references auth.users(id),
    created_at timestamptz default now()
);

-- 17. Admin Logs Table
create table if not exists public.admin_logs (
    id uuid default uuid_generate_v4() primary key,
    admin_id uuid references public.admin_users(id) on delete cascade not null,
    action text not null,
    reference_id text,
    details text,
    created_at timestamptz default now()
);

-- 18. Email Templates Table
create table if not exists public.email_templates (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    subject text not null,
    body_html text not null,
    variables text[] not null, -- e.g., ['studentName', 'rank']
    is_default boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 19. Email Deliveries Table
create table if not exists public.email_deliveries (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    certificate_id uuid references public.certificates(id) on delete set null,
    template_id uuid references public.email_templates(id),
    recipient_email text not null,
    subject text not null,
    status text not null default 'PENDING' check (status in ('PENDING', 'SENT', 'FAILED', 'RETRY')),
    sent_at timestamptz,
    failed_at timestamptz,
    error_message text,
    retry_count integer default 0,
    last_retry_at timestamptz,
    created_at timestamptz default now()
);

-- 20. Batch Email Jobs Table
create table if not exists public.batch_email_jobs (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    template_id uuid references public.email_templates(id),
    student_ids uuid[] not null,
    total_count integer default 0,
    sent_count integer default 0,
    failed_count integer default 0,
    status text not null default 'PENDING' check (status in ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    started_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz default now()
);

-- 21. Gallery Items Table
create table if not exists public.gallery_items (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    image_url text not null,
    category text not null check (category in ('CEREMONY', 'TOPPERS', 'EVENTS', 'OTHER')),
    year integer,
    featured boolean default false,
    created_at timestamptz default now()
);

-- 22. Certificate Settings Table
create table if not exists public.certificate_settings (
    id uuid default uuid_generate_v4() primary key, -- Usually just one row
    default_template text not null default 'CLASSIC',
    classic_config jsonb not null default '{}'::jsonb,
    modern_config jsonb not null default '{}'::jsonb,
    prestigious_config jsonb not null default '{}'::jsonb,
    updated_at timestamptz default now(),
    updated_by uuid references public.admin_users(id)
);

-- -----------------------------------------------------------------------------
-- TRIGGERS & FUNCTIONS
-- -----------------------------------------------------------------------------

-- Function to handle new student registration (Create wallet & check referral)
create or replace function public.handle_new_student()
returns trigger as $$
begin
    -- Create wallet for the student
    insert into public.wallets (student_id, balance)
    values (new.id, 0);

    -- If there's a referral code, we can log it but don't credit until payment is successful
    -- (Logic for actual reward credit is usually in the payment success trigger)

    return new;
end;
$$ language plpgsql security definer;

-- Trigger for student creation
drop trigger if exists on_student_created on public.students;
create trigger on_student_created
    after insert on public.students
    for each row execute function public.handle_new_student();


-- Function to handle successful payment
create or replace function public.handle_payment_success()
returns trigger as $$
declare
    v_student_id uuid;
    v_referred_by_code text;
    v_referral_code_id uuid;
    v_referrer_id uuid;
    v_referrer_role text;
    v_reward_amount decimal;
    v_owner_name text;
begin
    if new.status = 'SUCCESS' and (old.status is null or old.status != 'SUCCESS') then
        -- Get student info
        select id, referred_by_center_code into v_student_id, v_referred_by_code
        from public.students
        where id = new.student_id;

        -- If student was referred, credit the referrer
        if v_referred_by_code is not null then
            -- Find referral code
            select id, owner_id, type, reward_amount, owner_name 
            into v_referral_code_id, v_referrer_id, v_referrer_role, v_reward_amount, v_owner_name
            from public.referral_codes
            where code = v_referred_by_code and is_active = true;

            if v_referral_code_id is not null then
                -- Log the referral
                insert into public.referral_logs (
                    referral_code_id, referral_code, referrer_id, referrer_role,
                    new_user_id, new_user_name, amount, status
                ) values (
                    v_referral_code_id, v_referred_by_code, v_referrer_id, 
                    case when v_referrer_role = 'ADMIN_CENTER' then 'ADMIN' else 'CENTER' end,
                    v_student_id, (select name from public.students where id = v_student_id),
                    v_reward_amount, 'CREDITED'
                );

                -- Update referral code stats
                update public.referral_codes
                set total_referrals = total_referrals + 1,
                    total_earnings = total_earnings + v_reward_amount
                where id = v_referral_code_id;

                -- Credit the referrer's wallet (if they are a center/student)
                if v_referrer_role = 'CENTER_CODE' or v_referrer_role = 'CENTER' then
                    update public.wallets
                    set balance = balance + v_reward_amount
                    where student_id = v_referrer_id;

                    -- Add wallet transaction
                    insert into public.wallet_transactions (wallet_id, type, amount, reason, reference_id)
                    values (
                        (select id from public.wallets where student_id = v_referrer_id),
                        'CENTER_REWARD', v_reward_amount, 
                        'Referral reward for student ' || (select name from public.students where id = v_student_id),
                        new.id::text
                    );
                end if;
            end if;
        end if;
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for payment success
drop trigger if exists on_payment_success on public.payments;
create trigger on_payment_success
    after update of status on public.payments
    for each row execute function public.handle_payment_success();


-- RPC: Get Dashboard Stats
create or replace function public.get_admin_dashboard_stats()
returns jsonb as $$
declare
    v_stats jsonb;
begin
    select jsonb_build_object(
        'totalStudents', (select count(*) from public.students),
        'activeStudents', (select count(*) from public.students where status = 'ACTIVE'),
        'totalPayments', (select count(*) from public.payments),
        'successfulPayments', (select count(*) from public.payments where status = 'SUCCESS'),
        'totalRevenue', (select coalesce(sum(amount), 0) from public.payments where status = 'SUCCESS'),
        'examsCompleted', (select count(*) from public.exam_sessions where status = 'COMPLETED'),
        'certificatesIssued', (select count(*) from public.certificates),
        'pendingScholarships', (select count(*) from public.scholarships where approval_status = 'PENDING'),
        'totalCenterRewards', (select coalesce(sum(reward_amount), 0) from public.center_rewards where status = 'CREDITED')
    ) into v_stats;
    
    return v_stats;
end;
$$ language plpgsql security definer;

-- RPC: Get Class Wise Stats
create or replace function public.get_class_wise_stats()
returns setof jsonb as $$
begin
    return query
    select jsonb_build_object(
        'class', class_level,
        'studentCount', count(*),
        'examsTaken', (select count(*) from public.exam_results where class_level = s.class_level),
        'avgScore', (select coalesce(avg(total_score), 0) from public.exam_results where class_level = s.class_level),
        'topScore', (select coalesce(max(total_score), 0) from public.exam_results where class_level = s.class_level)
    )
    from public.students s
    group by class_level;
end;
$$ language plpgsql security definer;


-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
alter table public.students enable row level security;
alter table public.centers enable row level security;
alter table public.admin_users enable row level security;
alter table public.payments enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_sessions enable row level security;
alter table public.exam_results enable row level security;
alter table public.scholarships enable row level security;
alter table public.certificates enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_logs enable row level security;
alter table public.center_rewards enable row level security;
alter table public.consent_logs enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.admin_logs enable row level security;
alter table public.email_templates enable row level security;
alter table public.email_deliveries enable row level security;
alter table public.batch_email_jobs enable row level security;
alter table public.gallery_items enable row level security;
alter table public.certificate_settings enable row level security;

-- Policies for 'students'
create policy "Students can view their own profile" on public.students
    for select using (auth.uid() = id);

create policy "Admins can view all students" on public.students
    for select using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can update students" on public.students
    for update using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Public can register" on public.students
    for insert with check (true);

-- Policies for 'center_rewards'
create policy "Centers can view their own rewards" on public.center_rewards
    for select using (auth.uid() = center_owner_student_id);

create policy "Admins can view all rewards" on public.center_rewards
    for select using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Policies for 'wallets'
create policy "Students can view their own wallet" on public.wallets
    for select using (auth.uid() = student_id);

create policy "Admins can view all wallets" on public.wallets
    for select using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Policies for 'exam_sessions'
create policy "Students can manage their own sessions" on public.exam_sessions
    for all using (auth.uid() = student_id);

create policy "Admins can view all sessions" on public.exam_sessions
    for select using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Policies for 'exam_questions'
create policy "Anyone can view questions during exam" on public.exam_questions
    for select using (auth.role() = 'authenticated');

create policy "Admins can manage questions" on public.exam_questions
    for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Helper function to check if a user is super admin safely
create or replace function public.is_super_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_users
    where id = auth.uid() and role = 'SUPER_ADMIN'
  );
end;
$$ language plpgsql security definer;

-- Policies for 'admin_users'
create policy "Admins can view their own entry" on public.admin_users
    for select using (auth.uid() = id);

create policy "Super Admins can view all admins" on public.admin_users
    for select using (public.is_super_admin());

-- Policies for 'contact_submissions'
create policy "Anyone can submit contact form" on public.contact_submissions
    for insert with check (true);

create policy "Admins can view contact submissions" on public.contact_submissions
    for select using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Policies for Email System
create policy "Admins can manage email system" on public.email_templates
    for all using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can view deliveries" on public.email_deliveries
    for select using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can manage batch jobs" on public.batch_email_jobs
    for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Policies for Gallery
create policy "Anyone can view gallery" on public.gallery_items
    for select using (true);

create policy "Admins can manage gallery" on public.gallery_items
    for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Policies for Certificate Settings
create policy "Admins can manage certificate settings" on public.certificate_settings
    for all using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Anyone can view settings" on public.certificate_settings
    for select using (true);

-- Run this script in your Backend SQL Editor to create the Team Members table

create table if not exists public.team_members (
    id text primary key,
    name text not null,
    role text not null,
    description text not null,
    image_url text,
    display_order integer default 0,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.team_members enable row level security;

-- Policies
create policy "Team members are viewable by everyone"
    on public.team_members for select
    using (true);

-- Allow all authenticated users with email matching an admin to modify (you can restrict this further based on your admin schema)
create policy "Admins can insert team members"
    on public.team_members for insert
    with check (
        exists (
            select 1 from public.admin_users
            where id = auth.uid()
        )
    );

create policy "Admins can update team members"
    on public.team_members for update
    using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid()
        )
    );

create policy "Admins can delete team members"
    on public.team_members for delete
    using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid()
        )
    );

-- Insert initial data
insert into public.team_members (id, name, role, description, display_order) values
('1', 'Dr. Rajendra Prasad', 'Chairman', 'Former education minister with 30+ years of experience in educational policy making.', 1),
('2', 'Mrs. Sunita Devi', 'Director - Operations', 'Educational administrator specializing in scholarship program management.', 2),
('3', 'Mr. Vikram Singh', 'Head - Examination', 'Expert in conducting large-scale examinations with integrity and transparency.', 3),
('4', 'Ms. Priya Sharma', 'Student Relations', 'Dedicated to ensuring smooth communication between students and the organization.', 4)
on conflict do nothing;

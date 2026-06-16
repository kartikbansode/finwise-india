-- ============================================================
-- FinWise India — Database Schema
-- ============================================================

-- 1. PROFILES TABLE
-- Stores user type, GST status, and tax regime preference
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  user_type text check (user_type in ('freelancer', 'business')) default 'freelancer',
  is_gst_registered boolean default false,
  tax_regime text check (tax_regime in ('new', 'old')) default 'new',
  monthly_expense_estimate numeric default 0,
  is_pro boolean default false,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- 2. INCOME ENTRIES TABLE
-- Every payment a freelancer or business receives
create table income_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_name text not null,
  amount numeric not null,
  category text default 'other',
  entry_date date not null default current_date,
  notes text,
  created_at timestamp with time zone default now()
);

alter table income_entries enable row level security;

create policy "Users can view own income"
  on income_entries for select using (auth.uid() = user_id);

create policy "Users can insert own income"
  on income_entries for insert with check (auth.uid() = user_id);

create policy "Users can update own income"
  on income_entries for update using (auth.uid() = user_id);

create policy "Users can delete own income"
  on income_entries for delete using (auth.uid() = user_id);

-- 3. EXPENSE ENTRIES TABLE
-- For business owners tracking outgoing money
create table expense_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  description text not null,
  amount numeric not null,
  category text default 'other',
  entry_date date not null default current_date,
  created_at timestamp with time zone default now()
);

alter table expense_entries enable row level security;

create policy "Users can view own expenses"
  on expense_entries for select using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on expense_entries for insert with check (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on expense_entries for delete using (auth.uid() = user_id);

-- 4. SUBSCRIPTIONS TABLE
-- Tracks Razorpay subscription status
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  razorpay_subscription_id text,
  status text check (status in ('active', 'cancelled', 'expired')) default 'expired',
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select using (auth.uid() = user_id);

-- 5. AUTO-CREATE PROFILE ON SIGNUP
-- This trigger automatically creates a profile row when someone signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


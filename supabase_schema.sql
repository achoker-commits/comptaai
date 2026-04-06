-- ============================================
-- ComptaAI — Schéma Supabase complet
-- Exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- Extension UUID
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE: companies
-- ============================================
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  siret text,
  vat_number text,
  address text,
  thread_id text, -- mémoire agent IA
  created_at timestamptz default now() not null
);

-- RLS
alter table companies enable row level security;
create policy "Utilisateurs voient leurs sociétés" on companies
  for all using (auth.uid() = user_id);

-- ============================================
-- TABLE: documents
-- ============================================
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  type text check (type in ('invoice', 'receipt', 'bank_statement', 'other')) default 'other',
  storage_path text not null,
  amount numeric(12,2),
  category text,
  date date,
  vendor text,
  processed boolean default false,
  created_at timestamptz default now() not null
);

alter table documents enable row level security;
create policy "Utilisateurs voient leurs documents" on documents
  for all using (auth.uid() = user_id);

-- ============================================
-- TABLE: transactions
-- ============================================
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  document_id uuid references documents(id) on delete set null,
  label text not null,
  amount numeric(12,2) not null,
  type text check (type in ('debit', 'credit')) not null,
  category text not null default 'Non catégorisé',
  pcg_account text,                        -- Compte PCG (ex: 607000)
  tva_rate numeric(5,2) default 20,        -- Taux TVA en % (ex: 20, 10, 5.5)
  tva_amount numeric(12,2),                -- Montant TVA calculé
  date date not null,
  created_at timestamptz default now() not null
);

alter table transactions enable row level security;
create policy "Utilisateurs voient leurs transactions" on transactions
  for all using (
    company_id in (
      select id from companies where user_id = auth.uid()
    )
  );

-- ============================================
-- TABLE: subscriptions
-- ============================================
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text not null,
  stripe_subscription_id text not null,
  plan text check (plan in ('solo', 'pro', 'expert')) default 'solo',
  status text check (status in ('active', 'canceled', 'past_due')) default 'active',
  current_period_end timestamptz,
  created_at timestamptz default now() not null
);

alter table subscriptions enable row level security;
create policy "Utilisateurs voient leur abonnement" on subscriptions
  for all using (auth.uid() = user_id);

-- ============================================
-- STORAGE: bucket documents
-- ============================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Upload authentifié" on storage.objects
  for insert with check (
    bucket_id = 'documents' and auth.role() = 'authenticated'
  );

create policy "Lecture propriétaire" on storage.objects
  for select using (
    bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- Index pour les performances
-- ============================================
create index if not exists idx_companies_user_id on companies(user_id);
create index if not exists idx_documents_company_id on documents(company_id);
create index if not exists idx_documents_user_id on documents(user_id);
create index if not exists idx_transactions_company_id on transactions(company_id);
create index if not exists idx_transactions_date on transactions(date);
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);

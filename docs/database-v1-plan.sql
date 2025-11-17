CREATE TYPE role_type AS ENUM ('ADMIN', 'BDR', 'ACCOUNT_MANAGER', 'TEAM_LEAD');
CREATE TYPE request_status AS ENUM ('new', 'on progress', 'done', 'on hold');
CREATE TYPE request_type AS ENUM ('RESTAURANT', 'EVENT', 'CUISINE');
CREATE TYPE restaurant_status AS ENUM ('new', 'on progress', 'done', 'on hold');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'done');
CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state_code text,
  country_code text DEFAULT 'US',
  timezone text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cuisines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  phone text,
  timezone text,
  job_title text,
  city_id uuid NOT NULL REFERENCES public.cities(id),
  archived_at timestamptz,
  archived_by uuid REFERENCES auth.users(id),
  archive_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_type NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  PRIMARY KEY (user_id, role)
);

CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  leader_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE public.account_manager_cities (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, city_id)
);

CREATE TABLE public.archived_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  profile_snapshot jsonb NOT NULL,
  roles_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  archived_at timestamptz NOT NULL DEFAULT now(),
  archived_by uuid REFERENCES auth.users(id),
  archive_reason text
);

CREATE TABLE public.user_archive_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('ARCHIVE', 'RESTORE', 'DELETE')),
  performed_by uuid REFERENCES auth.users(id),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  location_hash text,
  crm_location_id text UNIQUE,
  pos_store_id text UNIQUE,
  previous_restaurant_id uuid REFERENCES public.restaurants(id),
  city_id uuid REFERENCES public.cities(id),
  primary_cuisine_id uuid REFERENCES public.cuisines(id),
  status restaurant_status NOT NULL DEFAULT 'new',
  onboarding_stage text,
  bdr_target_per_week integer NOT NULL DEFAULT 4,
  description text,
  onboarded_at timestamptz,
  onboarded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.restaurant_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  street text,
  suite text,
  city text,
  state text,
  postal_code text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.restaurant_assignments (
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_type NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (restaurant_id, user_id)
);

CREATE TABLE public.restaurant_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  status restaurant_status NOT NULL,
  notes text,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.restaurant_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status task_status NOT NULL DEFAULT 'todo',
  due_date date,
  completed_at timestamptz,
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.restaurant_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_type text,
  uploaded_by uuid REFERENCES auth.users(id),
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.restaurant_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.restaurant_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  inserted_rows integer NOT NULL DEFAULT 0,
  error_message text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  request_type request_type NOT NULL DEFAULT 'RESTAURANT',
  requester_id uuid NOT NULL REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  city_id uuid NOT NULL REFERENCES public.cities(id),
  CONSTRAINT requests_city_assignment_fk FOREIGN KEY (requester_id, city_id) REFERENCES public.account_manager_cities(user_id, city_id),
  status request_status NOT NULL DEFAULT 'new',
  priority text,
  category text,
  budget numeric,
  deadline date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archived_by uuid REFERENCES auth.users(id),
  archive_reason text
);

CREATE TABLE public.request_assignments (
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_type NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  PRIMARY KEY (request_id, user_id)
);

CREATE OR REPLACE FUNCTION public.assign_request_creator()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  assignment_user uuid;
BEGIN
  assignment_user := COALESCE(NEW.created_by, NEW.requester_id);
  IF assignment_user IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.request_assignments (request_id, user_id, role)
  VALUES (NEW.id, assignment_user, 'ADMIN')
  ON CONFLICT (request_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_assign_request_creator
AFTER INSERT ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.assign_request_creator();

CREATE TABLE public.request_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.request_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  status request_status NOT NULL,
  notes text,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.request_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.request_followers (
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (request_id, user_id)
);

CREATE TABLE public.request_archive_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('ARCHIVE', 'RESTORE', 'DELETE')),
  performed_by uuid REFERENCES auth.users(id),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.requests(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  subject text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.threads(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  request_id uuid REFERENCES public.requests(id) ON DELETE SET NULL,
  author_id uuid REFERENCES auth.users(id),
  body text NOT NULL,
  attachments jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.task_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type text NOT NULL,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  request_id uuid REFERENCES public.requests(id) ON DELETE SET NULL,
  team_id uuid REFERENCES public.teams(id),
  completed_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.monthly_task_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_month date NOT NULL,
  team_id uuid REFERENCES public.teams(id),
  completed_tasks integer NOT NULL,
  UNIQUE (metric_month, team_id)
);

CREATE TABLE public.onboarding_kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL,
  total_restaurants integer NOT NULL,
  weekly_onboards integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (snapshot_date)
);

CREATE TABLE public.location_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.cities(id),
  onboard_count integer NOT NULL,
  total_value numeric,
  snapshot_date date NOT NULL,
  UNIQUE (city_id, snapshot_date)
);

CREATE TABLE public.dashboard_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hidden_widgets text[] DEFAULT '{}',
  preferences jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_manager_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_archive_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_archive_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

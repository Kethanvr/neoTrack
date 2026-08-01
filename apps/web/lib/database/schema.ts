export const schema = `
pragma foreign_keys = on;
pragma journal_mode = wal;

create table if not exists users (
  id text primary key,
  email text not null unique collate nocase,
  password_hash text not null,
  full_name text not null,
  timezone text not null default 'Asia/Kolkata',
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists auth_sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists pairing_codes (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  code_hash text not null unique,
  expires_at text not null,
  used_at text,
  created_at text not null default (datetime('now'))
);

create table if not exists devices (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  name text not null,
  device_token_hash text not null unique,
  browser text not null default 'Chrome',
  extension_version text,
  last_seen_at text,
  revoked_at text,
  created_at text not null default (datetime('now'))
);

create table if not exists tracking_sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  device_id text not null references devices(id) on delete cascade,
  started_at text not null,
  ended_at text,
  active_duration_seconds integer not null default 0,
  total_activities integer not null default 0,
  status text not null default 'active' check(status in ('active','paused','completed','interrupted')),
  created_at text not null default (datetime('now'))
);

create table if not exists activities (
  id text primary key,
  client_activity_id text not null,
  user_id text not null references users(id) on delete cascade,
  device_id text not null references devices(id) on delete cascade,
  session_id text not null references tracking_sessions(id) on delete cascade,
  url text,
  domain text not null,
  page_title text,
  started_at text not null,
  ended_at text,
  duration_seconds integer not null default 0,
  interaction_count integer not null default 0,
  scroll_percentage integer not null default 0,
  category text,
  activity_name text,
  summary text,
  application_name text,
  productivity_level text not null default 'unknown',
  confidence real,
  analysis_status text not null default 'pending',
  sensitivity_level text not null default 'unknown',
  screenshot_path text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now')),
  unique(device_id, client_activity_id)
);

create table if not exists daily_summaries (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  summary_date text not null,
  total_active_seconds integer not null default 0,
  productive_seconds integer not null default 0,
  neutral_seconds integer not null default 0,
  distracting_seconds integer not null default 0,
  top_categories text not null default '[]',
  ai_summary text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now')),
  unique(user_id, summary_date)
);

create table if not exists user_settings (
  user_id text primary key references users(id) on delete cascade,
  screenshot_enabled integer not null default 1,
  screenshot_retention_hours integer not null default 0,
  capture_interval_seconds integer not null default 60,
  idle_threshold_seconds integer not null default 120,
  store_full_url integer not null default 0,
  store_page_title integer not null default 1,
  auto_delete_screenshots integer not null default 1,
  updated_at text not null default (datetime('now'))
);

create table if not exists blocked_domains (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  domain text not null collate nocase,
  reason text,
  created_at text not null default (datetime('now')),
  unique(user_id, domain)
);

create index if not exists activities_user_started_idx on activities(user_id, started_at desc);
create index if not exists activities_session_idx on activities(session_id);
create index if not exists sessions_user_started_idx on tracking_sessions(user_id, started_at desc);
create index if not exists devices_user_idx on devices(user_id);
`;


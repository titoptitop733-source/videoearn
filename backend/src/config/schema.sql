CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS levels (
  id               SERIAL PRIMARY KEY,
  level_number     INT NOT NULL UNIQUE CHECK (level_number BETWEEN 1 AND 9),
  name             VARCHAR(64) NOT NULL,
  price            NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  tasks_per_day    INT NOT NULL CHECK (tasks_per_day > 0),
  reward_per_task  NUMERIC(8, 2) NOT NULL CHECK (reward_per_task > 0),
  daily_income     NUMERIC(10, 2) GENERATED ALWAYS AS (tasks_per_day * reward_per_task) STORED,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username         VARCHAR(64) NOT NULL UNIQUE,
  email            VARCHAR(256) NOT NULL UNIQUE,
  password_hash    VARCHAR(256) NOT NULL,
  balance          NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  current_level_id INT REFERENCES levels(id) ON DELETE SET NULL,
  is_admin         BOOLEAN NOT NULL DEFAULT FALSE,
  last_withdraw_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS videos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(256) NOT NULL,
  url              TEXT NOT NULL,
  thumbnail_url    TEXT,
  duration_seconds INT NOT NULL DEFAULT 20 CHECK (duration_seconds > 0),
  required_level   INT NOT NULL DEFAULT 1 CHECK (required_level BETWEEN 1 AND 9),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('started', 'completed', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id         UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  status           task_status NOT NULL DEFAULT 'started',
  reward_earned    NUMERIC(8, 2),
  task_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  CONSTRAINT tasks_unique_per_day UNIQUE (user_id, video_id, task_date)
);

DO $$ BEGIN
  CREATE TYPE tx_type AS ENUM ('task_reward', 'deposit', 'withdrawal', 'level_purchase', 'admin_adjustment');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type             tx_type NOT NULL,
  amount           NUMERIC(12, 2) NOT NULL,
  balance_before   NUMERIC(12, 2) NOT NULL,
  balance_after    NUMERIC(12, 2) NOT NULL,
  description      TEXT,
  ref_request_id   UUID,
  ref_task_id      UUID,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE TYPE request_type AS ENUM ('deposit', 'withdrawal');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'completed', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('card', 'usdt_trc20', 'sbp');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type             request_type NOT NULL,
  amount           NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  method           payment_method NOT NULL,
  details          JSONB NOT NULL DEFAULT '{}',
  status           request_status NOT NULL DEFAULT 'pending',
  admin_note       TEXT,
  reviewed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username   ON users(username);
CREATE INDEX IF NOT EXISTS idx_tasks_user_date  ON tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_tx_user          ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_pending ON requests(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_videos_level     ON videos(required_level) WHERE is_active = TRUE;

INSERT INTO levels (level_number, name, price, tasks_per_day, reward_per_task) VALUES
  (1, 'Starter',    500,   10, 2.50),
  (2, 'Basic',     1000,   15, 3.50),
  (3, 'Bronze',    2000,   20, 5.00),
  (4, 'Silver',    4000,   25, 7.00),
  (5, 'Gold',      7000,   30, 10.00),
  (6, 'Platinum', 12000,   40, 13.00),
  (7, 'Diamond',  20000,   50, 17.00),
  (8, 'Elite',    35000,   65, 22.00),
  (9, 'Master',   60000,   80, 30.00)
ON CONFLICT (level_number) DO NOTHING;
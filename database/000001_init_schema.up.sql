CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE training_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    goal_name VARCHAR(100) NOT NULL,
    distance_km NUMERIC(5,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_training_goals_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_training_goals_dates
        CHECK (end_date >= start_date),
    CONSTRAINT chk_training_goals_distance
        CHECK (distance_km > 0)
);

CREATE TABLE training_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    goal_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_training_plans_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_training_plans_goal
        FOREIGN KEY (goal_id) REFERENCES training_goals(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_training_plans_status
        CHECK (status IN ('active', 'completed', 'cancelled')),
    CONSTRAINT chk_training_plans_dates
        CHECK (end_date >= start_date)
);

CREATE TABLE training_sessions (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    scheduled_date DATE NOT NULL,
    session_type VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    planned_duration_minutes INTEGER,
    planned_distance_km NUMERIC(5,2),
    difficulty_level VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'planned',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_training_sessions_plan
        FOREIGN KEY (plan_id) REFERENCES training_plans(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_training_sessions_status
        CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
    CONSTRAINT chk_training_sessions_type
        CHECK (session_type IN ('easy_run', 'interval', 'long_run', 'recovery')),
    CONSTRAINT chk_training_sessions_duration
        CHECK (planned_duration_minutes IS NULL OR planned_duration_minutes > 0),
    CONSTRAINT chk_training_sessions_distance
        CHECK (planned_distance_km IS NULL OR planned_distance_km >= 0)
);

CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    difficulty_level VARCHAR(20),
    default_duration_minutes INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_exercises_difficulty
        CHECK (
            difficulty_level IS NULL OR
            difficulty_level IN ('easy', 'medium', 'hard')
        ),
    CONSTRAINT chk_exercises_duration
        CHECK (default_duration_minutes IS NULL OR default_duration_minutes > 0)
);

CREATE TABLE training_session_exercises (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    sequence_number INTEGER NOT NULL,
    custom_description TEXT,
    custom_duration_minutes INTEGER,
    CONSTRAINT fk_training_session_exercises_session
        FOREIGN KEY (session_id) REFERENCES training_sessions(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_training_session_exercises_exercise
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_training_session_exercises_sequence
        UNIQUE (session_id, sequence_number),
    CONSTRAINT chk_training_session_exercises_sequence
        CHECK (sequence_number > 0),
    CONSTRAINT chk_training_session_exercises_duration
        CHECK (custom_duration_minutes IS NULL OR custom_duration_minutes > 0)
);

CREATE TABLE training_results (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE,
    actual_distance_km NUMERIC(6,2),
    actual_duration_minutes INTEGER,
    perceived_difficulty VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_training_results_session
        FOREIGN KEY (session_id) REFERENCES training_sessions(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_training_results_distance
        CHECK (actual_distance_km IS NULL OR actual_distance_km >= 0),
    CONSTRAINT chk_training_results_duration
        CHECK (actual_duration_minutes IS NULL OR actual_duration_minutes > 0),
    CONSTRAINT chk_training_results_difficulty
        CHECK (
            perceived_difficulty IS NULL OR
            perceived_difficulty IN ('easy', 'medium', 'hard')
        )
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,
    message VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    scheduled_for TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_notifications_type
        CHECK (type IN ('training_reminder', 'training_completed', 'system')),
    CONSTRAINT chk_notifications_status
        CHECK (status IN ('pending', 'sent', 'failed', 'read'))
);

-- Indexes
CREATE INDEX idx_training_goals_user_id ON training_goals(user_id);
CREATE INDEX idx_training_plans_user_id ON training_plans(user_id);
CREATE INDEX idx_training_plans_goal_id ON training_plans(goal_id);
CREATE INDEX idx_training_sessions_plan_id ON training_sessions(plan_id);
CREATE INDEX idx_training_sessions_scheduled_date ON training_sessions(scheduled_date);
CREATE INDEX idx_training_sessions_plan_date ON training_sessions(plan_id, scheduled_date);
CREATE INDEX idx_training_session_exercises_session_id ON training_session_exercises(session_id);
CREATE INDEX idx_training_results_session_id ON training_results(session_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);

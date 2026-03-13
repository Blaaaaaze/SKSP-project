-- Extend users with profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(4,1);
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Add distance to training_session_exercises
ALTER TABLE training_session_exercises ADD COLUMN IF NOT EXISTS custom_distance_km NUMERIC(5,2);
ALTER TABLE training_session_exercises ADD CONSTRAINT chk_training_session_exercises_distance
    CHECK (custom_distance_km IS NULL OR custom_distance_km >= 0);

-- Add feeling rating to training_results
ALTER TABLE training_results ADD COLUMN IF NOT EXISTS feeling_rating SMALLINT;
ALTER TABLE training_results ADD CONSTRAINT chk_training_results_feeling
    CHECK (feeling_rating IS NULL OR (feeling_rating >= 1 AND feeling_rating <= 5));

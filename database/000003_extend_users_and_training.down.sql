ALTER TABLE training_results DROP CONSTRAINT IF EXISTS chk_training_results_feeling;
ALTER TABLE training_results DROP COLUMN IF EXISTS feeling_rating;

ALTER TABLE training_session_exercises DROP CONSTRAINT IF EXISTS chk_training_session_exercises_distance;
ALTER TABLE training_session_exercises DROP COLUMN IF EXISTS custom_distance_km;

ALTER TABLE users DROP COLUMN IF EXISTS gender;
ALTER TABLE users DROP COLUMN IF EXISTS birth_date;
ALTER TABLE users DROP COLUMN IF EXISTS weight_kg;
ALTER TABLE users DROP COLUMN IF EXISTS height_cm;

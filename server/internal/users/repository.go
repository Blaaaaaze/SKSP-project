package users

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/service-marathon-app/server/internal/models"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrEmailExists = errors.New("email already exists")
	ErrNotFound    = errors.New("user not found")
)

type CreateParams struct {
	Name      string
	Email     string
	Password  string
	HeightCm  *int
	WeightKg  *float64
	BirthDate *string
	Gender    *string
}

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func IsEmailExists(err error) bool {
	return errors.Is(err, ErrEmailExists)
}

func (r *Repository) Create(ctx context.Context, p CreateParams) (*models.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	var birthDate interface{}
	if p.BirthDate != nil && *p.BirthDate != "" {
		birthDate = *p.BirthDate
	}

	var user models.User
	err = r.pool.QueryRow(ctx, `
		INSERT INTO users (name, email, password_hash, height_cm, weight_kg, birth_date, gender)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, name, email, password_hash, height_cm, weight_kg, birth_date, gender, created_at
	`, p.Name, p.Email, string(hash), p.HeightCm, p.WeightKg, birthDate, p.Gender).Scan(
		&user.ID, &user.Name, &user.Email, &user.PasswordHash,
		&user.HeightCm, &user.WeightKg, &user.BirthDate, &user.Gender, &user.CreatedAt,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrEmailExists
		}
		return nil, err
	}

	return &user, nil
}

func (r *Repository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.pool.QueryRow(ctx, `
		SELECT id, name, email, password_hash, height_cm, weight_kg, birth_date, gender, created_at
		FROM users WHERE email = $1
	`, email).Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash,
		&user.HeightCm, &user.WeightKg, &user.BirthDate, &user.Gender, &user.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *Repository) GetByID(ctx context.Context, id int64) (*models.User, error) {
	var user models.User
	err := r.pool.QueryRow(ctx, `
		SELECT id, name, email, password_hash, height_cm, weight_kg, birth_date, gender, created_at
		FROM users WHERE id = $1
	`, id).Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash,
		&user.HeightCm, &user.WeightKg, &user.BirthDate, &user.Gender, &user.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func CheckPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

type UpdateParams struct {
	Name      string
	HeightCm  *int
	WeightKg  *float64
	BirthDate *string
	Gender    *string
}

func (r *Repository) Update(ctx context.Context, userID int64, p UpdateParams) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE users SET name = $2, height_cm = $3, weight_kg = $4, birth_date = $5, gender = $6 WHERE id = $1
	`, userID, p.Name, p.HeightCm, p.WeightKg, p.BirthDate, p.Gender)
	return err
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                string
	DatabaseURL         string
	JWTSecret           string
	JWTExpirationHours  int
	CORSAllowedOrigins  string
	Env                 string
}

func LoadConfig() *Config {
	// Intentar cargar .env si existe
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "uleam_eventos_secret_2026_ciist_secure_key"
	}

	jwtExpHours, err := strconv.Atoi(os.Getenv("JWT_EXPIRATION_HOURS"))
	if err != nil || jwtExpHours <= 0 {
		jwtExpHours = 24
	}

	corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	if corsOrigins == "" {
		corsOrigins = "*"
	}

	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	return &Config{
		Port:               port,
		DatabaseURL:        dbURL,
		JWTSecret:          jwtSecret,
		JWTExpirationHours: jwtExpHours,
		CORSAllowedOrigins: corsOrigins,
		Env:                env,
	}
}

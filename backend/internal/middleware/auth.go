package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"uleam-eventos-api/internal/config"
)

func CORSMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func AuthMiddleware(cfg *config.Config, requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Encabezado de autorización ausente"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato de token no válido (debe ser Bearer <token>)"})
			c.Abort()
			return
		}

		tokenStr := parts[1]
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token JWT inválido o expirado"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Claims inválidos"})
			c.Abort()
			return
		}

		userRole, _ := claims["role"].(string)
		c.Set("userID", claims["user_id"])
		c.Set("userEmail", claims["email"])
		c.Set("userRole", userRole)

		// Verificar roles permitidos (RBAC - RNF-006, Tabla 30)
		if len(requiredRoles) > 0 {
			hasRole := false
			for _, r := range requiredRoles {
				if r == userRole || userRole == "SUPER_ADMIN" {
					hasRole = true
					break
				}
			}

			if !hasRole {
				c.JSON(http.StatusForbidden, gin.H{
					"error":   "Acceso denegado: permisos insuficientes para este recurso",
					"tu_rol":  userRole,
					"exigido": requiredRoles,
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

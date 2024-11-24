package main

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/Nerzal/gocloak/v12"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Config struct {
	KeycloakURL  string
	ClientID     string
	ClientSecret string
	Realm        string
}

var config = Config{
	KeycloakURL:  "https://keycloak.juliancoy.us/auth", // Added /auth to the URL
	ClientID:     "org-backend",                        // Your Keycloak client ID
	ClientSecret: os.Getenv("ORG_BACKEND_SECRET"),      // Secret for the Keycloak client
	Realm:        "opentdf",                            // Your Keycloak realm
}

func main() {
	// Validate if the ClientSecret is provided
	if config.ClientSecret == "" {
		panic("ORG_BACKEND_SECRET environment variable is not set")
	}

	// Test the connection to Keycloak
	testKeycloakConnection()

	router := gin.Default()

	// Enable CORS with default settings
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://localhost:5173"}, // Frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Define routes
	router.POST("/login", loginHandler)
	router.GET("/users", userInfoHandler) // Users endpoint

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Use HTTPS with the generated certificate
	router.RunTLS(":"+port, os.Getenv("ORG_CERT_LOCATION"), os.Getenv("ORG_KEY_LOCATION"))
}

// loginHandler authenticates the user with Keycloak and returns an access and refresh token.
func loginHandler(c *gin.Context) {
	type LoginRequest struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var loginReq LoginRequest
	if err := c.BindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	client := gocloak.NewClient(config.KeycloakURL) // Connect to Keycloak
	ctx := c.Request.Context()

	token, err := client.Login(ctx, config.ClientID, config.ClientSecret, config.Realm, loginReq.Username, loginReq.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Respond with access and refresh tokens
	c.JSON(http.StatusOK, gin.H{"access_token": token.AccessToken, "refresh_token": token.RefreshToken})
}

// userInfoHandler fetches user details using the Keycloak access token.
func userInfoHandler(c *gin.Context) {
	accessToken := c.GetHeader("Authorization")
	if accessToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
		return
	}

	client := gocloak.NewClient(config.KeycloakURL) // Connect to Keycloak
	ctx := c.Request.Context()

	// Log the token for debugging (but don't expose in production)
	fmt.Println("Received Access Token:", accessToken)

	valid, err := client.RetrospectToken(ctx, accessToken, config.ClientID, config.ClientSecret, config.Realm)
	if err != nil {
		fmt.Println("Error while validating token:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token validation failed"})
		return
	}
	if valid == nil || !*valid.Active {
		fmt.Println("Token is not active")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token is not active"})
		return
	}

	// Get user info if token is valid
	userInfo, err := client.GetUserInfo(ctx, accessToken, config.Realm)
	if err != nil {
		// Log the error for debugging
		fmt.Println("Failed to fetch user info:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to fetch user info"})
		return
	}

	// Return user info
	c.JSON(http.StatusOK, gin.H{"user_info": userInfo})
}

// testKeycloakConnection tests the connection to the Keycloak server and prints status
func testKeycloakConnection() {
	client := gocloak.NewClient(config.KeycloakURL)
	ctx := context.Background()

	fmt.Println("Testing Keycloak connection...")

	// Print the token endpoint URL for debugging
	tokenURL := fmt.Sprintf("%s/realms/%s/protocol/openid-connect/token", config.KeycloakURL, config.Realm)
	fmt.Printf("Attempting to connect to token endpoint: %s\n", tokenURL)

	// Try to get a token using client credentials
	token, err := client.LoginClient(ctx, config.ClientID, config.ClientSecret, config.Realm)
	if err != nil {
		fmt.Printf("Error connecting to Keycloak: %v\n", err)
		fmt.Println("\nAdditional debug information:")
		fmt.Printf("- Keycloak URL: %s\n", config.KeycloakURL)
		fmt.Printf("- Realm: %s\n", config.Realm)
		fmt.Printf("- Client ID: %s\n", config.ClientID)
		fmt.Printf("- Client Secret length: %d\n", len(config.ClientSecret))

		// Try to make a direct HTTP request to verify the server is reachable
		resp, httpErr := http.Get(config.KeycloakURL)
		if httpErr != nil {
			fmt.Printf("\nCould not reach Keycloak server: %v\n", httpErr)
		} else {
			fmt.Printf("\nKeycloak server is reachable (HTTP %d)\n", resp.StatusCode)
			resp.Body.Close()
		}

		os.Exit(1)
	}

	fmt.Printf("Successfully connected to Keycloak! Token type: %s\n", token.TokenType)
}

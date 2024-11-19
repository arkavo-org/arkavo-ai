package main

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var jwtSecret = []byte("your-secret-key") // Replace with your JWT signing secret

type UserClaims struct {
	UserID string `json:"sub"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

// MongoDB client setup
var db *mongo.Database

func init() {
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	db = client.Database("mydb")
}

type Event struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID   string             `bson:"userID" json:"userID"`
	Title    string             `bson:"title" json:"title"`
	Date     string             `bson:"date" json:"date"`
	Location string             `bson:"location" json:"location"`
}

// Middleware to authenticate and authorize user
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" || !strings.HasPrefix(tokenString, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing or invalid"})
			return
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ")
		token, err := jwt.ParseWithClaims(tokenString, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if claims, ok := token.Claims.(*UserClaims); ok && token.Valid {
			c.Set("userID", claims.UserID)
			c.Set("role", claims.Role)
			c.Next()
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			log.Println("Token parsing error:", err)
		}
	}
}

// Check if the user has permission to modify a resource
func checkOwnership(userID string, resourceUserID string) bool {
	return userID == resourceUserID
}

// Handler to update an event (only if the user is the owner)
func updateEventHandler(c *gin.Context) {
	userID := c.GetString("userID") // Authenticated user ID from context
	role := c.GetString("role")     // User's role
	eventID := c.Param("eventID")   // Event ID from request parameters

	// Convert eventID to ObjectID
	oid, err := primitive.ObjectIDFromHex(eventID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	// Retrieve the event from MongoDB
	event := Event{}
	err = db.Collection("events").FindOne(context.TODO(), bson.M{"_id": oid}).Decode(&event)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Check if the user is allowed to modify this event
	if !checkOwnership(userID, event.UserID) && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to modify this event"})
		return
	}

	// Parse the request body
	var updateData Event
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	// Update the event in MongoDB
	update := bson.M{"$set": bson.M{"title": updateData.Title, "date": updateData.Date, "location": updateData.Location}}
	_, err = db.Collection("events").UpdateOne(context.TODO(), bson.M{"_id": oid}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event updated successfully"})
}

func main() {
	router := gin.Default()

	// Protected routes (require authentication)
	router.Use(AuthMiddleware())

	// Update event route
	router.PATCH("/api/events/:eventID", updateEventHandler)

	router.Run(":3000")
}

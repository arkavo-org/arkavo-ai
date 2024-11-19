# Stage 1: Build the Go application
FROM cgr.dev/chainguard/go as builder

WORKDIR /app

# Copy go.mod and go.sum, and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code and build the binary
COPY . .
RUN go build -o /app/akavo_entity db_server.go

# Stage 2: Run the compiled binary with Chainguard's distroless base image
FROM cgr.dev/chainguard/static:latest

WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/akavo_entity .

# Expose the application port
EXPOSE 3000

# Run the binary
CMD ["/app/akavo_entity"]

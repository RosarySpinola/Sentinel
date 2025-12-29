FROM rust:1.83-slim-bookworm as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Copy manifests
COPY Cargo.toml Cargo.lock* ./

# Create dummy src for caching dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies only
RUN cargo build --release && rm -rf src

# Copy actual source
COPY src ./src

# Build the application
RUN touch src/main.rs && cargo build --release

# Runtime stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /app/target/release/sentinel-api .

# Expose port
EXPOSE 8080

# Set environment
ENV RUST_LOG=sentinel_api=info,tower_http=debug

# Run the application
CMD ["./sentinel-api"]

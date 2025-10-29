FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o blog-service .
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/blog-service .
EXPOSE 8088
CMD ["./blog-service"]

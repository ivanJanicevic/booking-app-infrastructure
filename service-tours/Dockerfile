FROM openjdk:21-jdk-slim

WORKDIR /app

COPY target/tours-0.0.1-SNAPSHOT.jar app.jar

# HTTP REST API port
EXPOSE 8083
# Napomena: Tours service NE treba gRPC server port jer je samo gRPC CLIENT

ENTRYPOINT ["java", "-jar", "app.jar"]

FROM openjdk:17-jdk-slim

WORKDIR /app

ARG JAR_FILE=target/*.jar

COPY ${JAR_FILE} app.jar

# HTTP REST API port
EXPOSE 8081

# gRPC Server port
EXPOSE 9094

ENTRYPOINT ["java", "-jar", "app.jar"]
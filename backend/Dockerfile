# Stage 1: Build the Spring Boot application using Java 25 JDK
FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper and POM files first for dependency caching
COPY .mvn/ .mvn/
COPY mvnw mvnw
COPY pom.xml pom.xml

# Ensure mvnw has execute permissions
RUN chmod +x mvnw

# Copy source code
COPY src/ src/

# Build the jar package (skipping tests for speed)
RUN ./mvnw clean package -DskipTests

# Stage 2: Create the runtime container using Java 25 JRE
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Copy the built jar file from Stage 1
COPY --from=build /app/target/*.jar app.jar

# Expose backend port 8080
EXPOSE 8080

# Execute Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]

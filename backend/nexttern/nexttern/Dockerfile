# Use Eclipse Temurin Java 21 as the base image
FROM eclipse-temurin:21-jdk

# Set the working directory
WORKDIR /app

# Copy the Maven wrapper and project files
COPY . .

# Make sure the Maven wrapper is executable
RUN chmod +x ./mvnw

# Build the application (skip tests for faster build)
RUN ./mvnw package -DskipTests

# Expose the default Spring Boot port
EXPOSE 8080

# Run the Spring Boot application
CMD ["./mvnw", "spring-boot:run"]

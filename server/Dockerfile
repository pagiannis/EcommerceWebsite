# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app

# Κατέβασε dependencies πρώτα (cache layer — δεν ξανατρέχει αν δεν αλλάξει το pom)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build το jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Run stage ----
FROM eclipse-temurin:25-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
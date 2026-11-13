
FROM maven:3.9.11-eclipse-temurin-17 AS build

WORKDIR /app

COPY . .

RUN chmod +x mvnw

RUN ./mvnw -B -DskipTests clean package

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/reusecircle-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

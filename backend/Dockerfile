# Bước 1: Mượn một máy chủ có sẵn Maven và Java để build code
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copy file cấu hình thư viện và toàn bộ mã nguồn vào
COPY pom.xml .
COPY src ./src
# Chạy lệnh đóng gói code thành file .jar
RUN mvn clean package -DskipTests

# Bước 2: Tạo môi trường chạy app siêu nhẹ
FROM eclipse-temurin:21-jdk
WORKDIR /app
# Lấy file .jar đã build thành công ở Bước 1 sang đây
COPY --from=build /app/target/*.jar app.jar
# Mở cổng 8080 để Render kết nối
EXPOSE 8080
# Khởi động Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
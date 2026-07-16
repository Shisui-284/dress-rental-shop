package com.example.demo; // Đổi lại package cho khớp với project của bạn nếu cần

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Mở cửa cho toàn bộ API (từ /api/auth đến /api/products, v.v...)
                .allowedOrigins(
                        "https://dress-rental-shop.vercel.app", // Cho phép Vercel (chính thức)
                        "http://localhost:5173" // Vẫn giữ cổng này để bạn code và test ở máy nhà
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Cho phép các hành động cơ bản
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
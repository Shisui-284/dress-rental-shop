package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // Kéo thư viện này vào
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) // Kích hoạt cho phép cấu hình CORS bên dưới
                .csrf(csrf -> csrf.disable()) // Tắt bảo vệ CSRF vì chúng ta dùng API với React
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/uploads/**").permitAll() // Cho phép xem ảnh không cần đăng nhập
                        .requestMatchers("/api/revenue/**", "/api/users/**").hasRole("ADMIN") // Chỉ ADMIN mới được xem doanh thu và quản lý nhân viên
                        .anyRequest().authenticated() // Mọi request khác đều phải đăng nhập
                )
                .httpBasic(basic -> basic.authenticationEntryPoint((request, response, authException) -> {
                    // Tắt popup đăng nhập mặc định của trình duyệt
                    response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                }));

        return http.build();
    }

    // Đây chính là tờ Giấy thông hành cho React
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép frontend ở cổng 5173 gọi sang
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true); // Cho phép gửi kèm thông tin đăng nhập

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Áp dụng giấy thông hành này cho mọi đường dẫn API (/**)
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
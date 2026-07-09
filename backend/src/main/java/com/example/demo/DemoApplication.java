package com.example.demo;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	// Đoạn code này sẽ tự động chạy 1 lần mỗi khi bật Server
	@Bean
	public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			// Kiểm tra xem đã có admin chưa
			if (userRepository.findByUsername("admin").isEmpty()) {
				User admin = new User();
				admin.setUsername("admin");
				// Mật khẩu 123456 sẽ được mã hóa trước khi lưu
				admin.setPassword(passwordEncoder.encode("123456"));
				admin.setFullName("Chủ Cửa Hàng");
				admin.setRole("ADMIN"); // Phân quyền Admin
				admin.setIsActive(true);

				userRepository.save(admin);
				System.out.println("Đã khởi tạo tài khoản ADMIN mặc định thành công!");
			}
		};
	}
}
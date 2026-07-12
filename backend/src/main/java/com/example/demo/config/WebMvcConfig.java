package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String currentPath = System.getProperty("user.dir");
        String uploadsPath = currentPath;
        if (currentPath.endsWith("backend")) {
            uploadsPath = currentPath.substring(0, currentPath.length() - 8);
        }
        uploadsPath = uploadsPath + "/uploads/";
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsPath);
    }
}

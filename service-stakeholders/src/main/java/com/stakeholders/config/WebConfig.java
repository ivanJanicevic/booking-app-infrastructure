package com.stakeholders.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        System.out.println("register22" + registry.toString());
        registry.addResourceHandler("/uploads/profile-pictures/**")
                .addResourceLocations("file:./uploads/profile-pictures/");
    }
}
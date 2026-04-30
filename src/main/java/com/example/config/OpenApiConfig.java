package com.example.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Markdown Reader API")
                        .version("1.0.0")
                        .description("Markdown 笔记阅读器的 RESTful API 文档")
                        .contact(new Contact()
                                .name("Developer")
                                .email("developer@example.com")));
    }
}

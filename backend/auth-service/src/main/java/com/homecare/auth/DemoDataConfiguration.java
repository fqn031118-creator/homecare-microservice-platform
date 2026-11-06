package com.homecare.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;

@Configuration
@Profile("demo")
public class DemoDataConfiguration {
  @Bean
  CommandLineRunner demoUsers(UserStoreService users) {
    return args -> users.init();
  }
}

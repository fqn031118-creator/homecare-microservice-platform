package com.homecare.staff;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class StaffServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(StaffServiceApplication.class, args);
    }
}

@RestController
class StaffHealthController {
    @GetMapping("/health")
    public String health() {
        return "staff-service ok";
    }
}

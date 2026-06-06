package com.homecare.auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResult login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResult register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @GetMapping("/phone-exists")
    public PhoneExistsResponse phoneExists(@RequestParam("phone") String phone) {
        return new PhoneExistsResponse(authService.phoneExists(phone));
    }

    @PutMapping("/profile")
    public AuthResult updateProfile(@RequestBody UpdateProfileRequest request) {
        return authService.updateProfile(request);
    }
}

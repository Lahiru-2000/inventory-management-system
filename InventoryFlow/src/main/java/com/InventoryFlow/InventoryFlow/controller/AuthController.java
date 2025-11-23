package com.InventoryFlow.InventoryFlow.controller;

import com.InventoryFlow.InventoryFlow.dto.ApiResponse;
import com.InventoryFlow.InventoryFlow.dto.LoginRequest;
import com.InventoryFlow.InventoryFlow.dto.LoginResponse;
import com.InventoryFlow.InventoryFlow.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}



package com.InventoryFlow.InventoryFlow.controller;

import com.InventoryFlow.InventoryFlow.dto.ApiResponse;
import com.InventoryFlow.InventoryFlow.dto.RoleDTO;
import com.InventoryFlow.InventoryFlow.entity.Role;
import com.InventoryFlow.InventoryFlow.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/roles")
@CrossOrigin(origins = "*")
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleDTO>>> getAllRoles() {
        List<RoleDTO> roles = roleRepository.findAll().stream()
                .map(role -> new RoleDTO(role.getId(), role.getName().name()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(roles));
    }
}


package com.fintrack.controller;

import com.fintrack.dto.CategoryDTO;
import com.fintrack.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getCategories(
            Authentication auth,
            @RequestParam(required = false) String type) {
        if (type != null && !type.isEmpty()) {
            return ResponseEntity.ok(categoryService.getUserCategoriesByType(auth.getName(), type));
        }
        return ResponseEntity.ok(categoryService.getUserCategories(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(
            @Valid @RequestBody CategoryDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(categoryService.createCategory(dto, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(categoryService.updateCategory(id, dto, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id,
            Authentication auth) {
        categoryService.deleteCategory(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}

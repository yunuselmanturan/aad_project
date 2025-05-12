package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.CategoryDTO;
import com.example.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllRootCategories() {
        List<CategoryDTO> categories = categoryService.findAllRoot();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
    
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.findAll();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategory(@PathVariable Long id) {
        CategoryDTO categoryDTO = categoryService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(categoryDTO));
    }
    
    @GetMapping("/{id}/subcategories")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getSubcategories(@PathVariable Long id) {
        List<CategoryDTO> subcategories = categoryService.findSubcategories(id);
        return ResponseEntity.ok(ApiResponse.success(subcategories));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(@RequestBody CategoryDTO categoryDTO) {
        CategoryDTO createdCategory = categoryService.create(categoryDTO);
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", createdCategory));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(@PathVariable Long id, @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO updatedCategory = categoryService.update(id, categoryDTO);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updatedCategory));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
} 
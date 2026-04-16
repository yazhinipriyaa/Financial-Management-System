package com.fintrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryDTO {
    private Long id;

    @NotBlank(message = "Category name is required")
    @Size(max = 50, message = "Name must not exceed 50 characters")
    private String name;

    @NotBlank(message = "Type is required")
    private String type; // INCOME or EXPENSE

    private String icon = "📁";
    private String color = "#6366f1";
}

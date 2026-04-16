package com.fintrack.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetDTO {
    private Long id;

    @NotNull(message = "Limit amount is required")
    @DecimalMin(value = "1.00", message = "Limit must be at least 1")
    private BigDecimal limitAmount;

    private BigDecimal spentAmount;

    @NotNull(message = "Month is required")
    private Integer month;

    @NotNull(message = "Year is required")
    private Integer year;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private Double percentUsed;
}

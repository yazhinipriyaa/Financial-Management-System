package com.fintrack.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionDTO {
    private Long id;

    @Size(max = 200, message = "Description must not exceed 200 characters")
    private String description;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Type is required")
    private String type; // INCOME or EXPENSE

    @NotNull(message = "Date is required")
    private LocalDate transactionDate;

    private Boolean isRecurring = false;
    private String recurrencePeriod;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
}

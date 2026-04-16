package com.fintrack.controller;

import com.fintrack.dto.BudgetDTO;
import com.fintrack.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDTO>> getBudgets(
            Authentication auth,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        if (month == null) month = LocalDate.now().getMonthValue();
        if (year == null) year = LocalDate.now().getYear();
        return ResponseEntity.ok(budgetService.getBudgets(auth.getName(), month, year));
    }

    @PostMapping
    public ResponseEntity<BudgetDTO> createOrUpdateBudget(
            @Valid @RequestBody BudgetDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(budgetService.createOrUpdateBudget(dto, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id,
            Authentication auth) {
        budgetService.deleteBudget(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}

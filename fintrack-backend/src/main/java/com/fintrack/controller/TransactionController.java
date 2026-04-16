package com.fintrack.controller;

import com.fintrack.dto.DashboardSummaryDTO;
import com.fintrack.dto.TransactionDTO;
import com.fintrack.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<Page<TransactionDTO>> getTransactions(
            Authentication auth,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                transactionService.getTransactions(auth.getName(), type, page, size));
    }

    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(
            @Valid @RequestBody TransactionDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(transactionService.createTransaction(dto, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDTO> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, dto, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            Authentication auth) {
        transactionService.deleteTransaction(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(Authentication auth) {
        return ResponseEntity.ok(transactionService.getDashboardSummary(auth.getName()));
    }
}

package com.fintrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryDTO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netBalance;
    private Double savingsRate;
    private List<TransactionDTO> recentTransactions;
    private List<Map<String, Object>> expenseByCategory;
    private List<Map<String, Object>> monthlyTrend;
}

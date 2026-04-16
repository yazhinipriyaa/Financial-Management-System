package com.fintrack.service;

import com.fintrack.dto.DashboardSummaryDTO;
import com.fintrack.dto.TransactionDTO;
import com.fintrack.entity.Category;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BudgetService budgetService;

    public TransactionService(TransactionRepository transactionRepository,
                              CategoryRepository categoryRepository,
                              UserRepository userRepository,
                              @Lazy BudgetService budgetService) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.budgetService = budgetService;
    }

    @Transactional
    public TransactionDTO createTransaction(TransactionDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = new Transaction();
        transaction.setDescription(dto.getDescription());
        transaction.setAmount(dto.getAmount());
        transaction.setType(dto.getType());
        transaction.setTransactionDate(dto.getTransactionDate());
        transaction.setIsRecurring(dto.getIsRecurring() != null ? dto.getIsRecurring() : false);
        transaction.setRecurrencePeriod(dto.getRecurrencePeriod());
        transaction.setUser(user);

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            if (!category.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Category not found");
            }
            transaction.setCategory(category);
        }

        transaction = transactionRepository.save(transaction);

        // Sync budget spent amount if this is an EXPENSE with a category
        if ("EXPENSE".equals(transaction.getType()) && transaction.getCategory() != null) {
            LocalDate d = transaction.getTransactionDate();
            budgetService.syncBudgetSpent(user.getId(), transaction.getCategory().getId(),
                    d.getMonthValue(), d.getYear());
        }

        return mapToDTO(transaction);
    }

    @Transactional
    public TransactionDTO updateTransaction(Long id, TransactionDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        // Capture old category before update for sync
        Long oldCategoryId = transaction.getCategory() != null ? transaction.getCategory().getId() : null;
        LocalDate oldDate = transaction.getTransactionDate();
        String oldType = transaction.getType();

        transaction.setDescription(dto.getDescription());
        transaction.setAmount(dto.getAmount());
        transaction.setType(dto.getType());
        transaction.setTransactionDate(dto.getTransactionDate());
        transaction.setIsRecurring(dto.getIsRecurring() != null ? dto.getIsRecurring() : false);
        transaction.setRecurrencePeriod(dto.getRecurrencePeriod());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            if (!category.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Category not found");
            }
            transaction.setCategory(category);
        }

        transaction = transactionRepository.save(transaction);

        // Sync old category budget (if it was an expense)
        if ("EXPENSE".equals(oldType) && oldCategoryId != null) {
            budgetService.syncBudgetSpent(user.getId(), oldCategoryId,
                    oldDate.getMonthValue(), oldDate.getYear());
        }
        // Sync new category budget (if it is now an expense)
        if ("EXPENSE".equals(transaction.getType()) && transaction.getCategory() != null) {
            LocalDate d = transaction.getTransactionDate();
            budgetService.syncBudgetSpent(user.getId(), transaction.getCategory().getId(),
                    d.getMonthValue(), d.getYear());
        }

        return mapToDTO(transaction);
    }

    @Transactional
    public void deleteTransaction(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        Long categoryId = transaction.getCategory() != null ? transaction.getCategory().getId() : null;
        LocalDate date = transaction.getTransactionDate();
        String type = transaction.getType();

        transactionRepository.delete(transaction);

        // Sync budget after deletion
        if ("EXPENSE".equals(type) && categoryId != null) {
            budgetService.syncBudgetSpent(user.getId(), categoryId,
                    date.getMonthValue(), date.getYear());
        }
    }

    public Page<TransactionDTO> getTransactions(String email, String type, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size);

        Page<Transaction> transactions;
        if (type != null && !type.isEmpty()) {
            transactions = transactionRepository.findByUserIdAndTypeOrderByTransactionDateDesc(
                    user.getId(), type, pageable);
        } else {
            transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(
                    user.getId(), pageable);
        }

        return transactions.map(this::mapToDTO);
    }

    public DashboardSummaryDTO getDashboardSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        // Current month totals
        BigDecimal totalIncome = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                user.getId(), "INCOME", startOfMonth, endOfMonth);
        BigDecimal totalExpenses = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                user.getId(), "EXPENSE", startOfMonth, endOfMonth);

        BigDecimal netBalance = totalIncome.subtract(totalExpenses);
        Double savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? netBalance.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        // Recent transactions
        List<TransactionDTO> recentTransactions = transactionRepository
                .findTop5ByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        // Expense by category
        List<Object[]> categoryData = transactionRepository.sumAmountGroupByCategory(
                user.getId(), "EXPENSE", startOfMonth, endOfMonth);
        List<Map<String, Object>> expenseByCategory = categoryData.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0] != null ? row[0] : "Uncategorized");
            map.put("value", row[1]);
            return map;
        }).collect(Collectors.toList());

        // Monthly trend (last 6 months)
        LocalDate sixMonthsAgo = now.minusMonths(5).withDayOfMonth(1);
        List<Object[]> trendData = transactionRepository.monthlyTrend(
                user.getId(), sixMonthsAgo, endOfMonth);

        Map<Integer, Map<String, Object>> trendMap = new LinkedHashMap<>();
        String[] monthNames = {"", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        for (int i = 0; i < 6; i++) {
            LocalDate d = now.minusMonths(5 - i);
            int key = d.getYear() * 100 + d.getMonthValue();
            Map<String, Object> entry = new HashMap<>();
            entry.put("month", monthNames[d.getMonthValue()]);
            entry.put("income", BigDecimal.ZERO);
            entry.put("expense", BigDecimal.ZERO);
            trendMap.put(key, entry);
        }

        for (Object[] row : trendData) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            String tType = (String) row[2];
            BigDecimal sum = (BigDecimal) row[3];
            int key = year * 100 + month;
            if (trendMap.containsKey(key)) {
                if ("INCOME".equals(tType)) {
                    trendMap.get(key).put("income", sum);
                } else {
                    trendMap.get(key).put("expense", sum);
                }
            }
        }

        return DashboardSummaryDTO.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netBalance(netBalance)
                .savingsRate(savingsRate)
                .recentTransactions(recentTransactions)
                .expenseByCategory(expenseByCategory)
                .monthlyTrend(new ArrayList<>(trendMap.values()))
                .build();
    }

    private TransactionDTO mapToDTO(Transaction t) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(t.getId());
        dto.setDescription(t.getDescription());
        dto.setAmount(t.getAmount());
        dto.setType(t.getType());
        dto.setTransactionDate(t.getTransactionDate());
        dto.setIsRecurring(t.getIsRecurring());
        dto.setRecurrencePeriod(t.getRecurrencePeriod());
        if (t.getCategory() != null) {
            dto.setCategoryId(t.getCategory().getId());
            dto.setCategoryName(t.getCategory().getName());
            dto.setCategoryIcon(t.getCategory().getIcon());
            dto.setCategoryColor(t.getCategory().getColor());
        }
        return dto;
    }
}

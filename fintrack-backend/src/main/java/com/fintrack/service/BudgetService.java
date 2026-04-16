package com.fintrack.service;

import com.fintrack.dto.BudgetDTO;
import com.fintrack.entity.Budget;
import com.fintrack.entity.Category;
import com.fintrack.entity.User;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public List<BudgetDTO> getBudgets(String email, Integer month, Integer year) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(
                user.getId(), month, year);

        return budgets.stream().map(b -> {
            // Calculate actual spent from transactions
            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            BigDecimal spent = transactionRepository.sumExpenseByCategory(
                    user.getId(), b.getCategory().getId(), start, end);
            b.setSpentAmount(spent);
            return mapToDTO(b);
        }).collect(Collectors.toList());
    }

    @Transactional
    public BudgetDTO createOrUpdateBudget(BudgetDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Category not found");
        }

        Budget budget = budgetRepository
                .findByUserIdAndCategoryIdAndMonthAndYear(
                        user.getId(), dto.getCategoryId(), dto.getMonth(), dto.getYear())
                .orElse(Budget.builder()
                        .user(user)
                        .category(category)
                        .month(dto.getMonth())
                        .year(dto.getYear())
                        .spentAmount(BigDecimal.ZERO)
                        .build());

        budget.setLimitAmount(dto.getLimitAmount());

        // Calculate and persist spent amount before saving
        LocalDate start = LocalDate.of(dto.getYear(), dto.getMonth(), 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        BigDecimal spent = transactionRepository.sumExpenseByCategory(
                user.getId(), category.getId(), start, end);
        budget.setSpentAmount(spent);
        budget = budgetRepository.save(budget);

        return mapToDTO(budget);
    }

    @Transactional
    public void syncBudgetSpent(Long userId, Long categoryId, int month, int year) {
        budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(userId, categoryId, month, year)
                .ifPresent(budget -> {
                    LocalDate start = LocalDate.of(year, month, 1);
                    LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
                    BigDecimal spent = transactionRepository.sumExpenseByCategory(
                            userId, categoryId, start, end);
                    budget.setSpentAmount(spent);
                    budgetRepository.save(budget);
                });
    }

    @Transactional
    public void deleteBudget(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        budgetRepository.delete(budget);
    }

    private BudgetDTO mapToDTO(Budget b) {
        BudgetDTO dto = new BudgetDTO();
        dto.setId(b.getId());
        dto.setLimitAmount(b.getLimitAmount());
        dto.setSpentAmount(b.getSpentAmount());
        dto.setMonth(b.getMonth());
        dto.setYear(b.getYear());
        dto.setCategoryId(b.getCategory().getId());
        dto.setCategoryName(b.getCategory().getName());
        dto.setCategoryIcon(b.getCategory().getIcon());
        dto.setCategoryColor(b.getCategory().getColor());

        if (b.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
            dto.setPercentUsed(b.getSpentAmount()
                    .divide(b.getLimitAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue());
        } else {
            dto.setPercentUsed(0.0);
        }

        return dto;
    }
}

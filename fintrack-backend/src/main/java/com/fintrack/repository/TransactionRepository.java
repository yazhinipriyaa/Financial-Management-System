package com.fintrack.repository;

import com.fintrack.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId, Pageable pageable);

    List<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long userId, LocalDate startDate, LocalDate endDate);

    Page<Transaction> findByUserIdAndTypeOrderByTransactionDateDesc(
            Long userId, String type, Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserAndTypeAndDateBetween(
            @Param("userId") Long userId,
            @Param("type") String type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t.category.name, SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate GROUP BY t.category.name")
    List<Object[]> sumAmountGroupByCategory(
            @Param("userId") Long userId,
            @Param("type") String type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT YEAR(t.transactionDate), MONTH(t.transactionDate), t.type, SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.transactionDate BETWEEN :startDate AND :endDate GROUP BY YEAR(t.transactionDate), MONTH(t.transactionDate), t.type ORDER BY YEAR(t.transactionDate), MONTH(t.transactionDate)")
    List<Object[]> monthlyTrend(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    List<Transaction> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'EXPENSE' AND t.category.id = :categoryId AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumExpenseByCategory(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}

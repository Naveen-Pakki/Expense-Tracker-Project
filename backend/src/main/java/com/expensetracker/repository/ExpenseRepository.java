package com.expensetracker.repository;

import com.expensetracker.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    Page<Expense> findByUserUserId(Long userId, Pageable pageable);

    List<Expense> findByUserUserId(Long userId);

    @Query("SELECT e FROM Expense e WHERE e.user.userId = :userId " +
            "AND (:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.notes) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:categoryId IS NULL OR e.category.categoryId = :categoryId) " +
            "AND (:startDate IS NULL OR e.expenseDate >= :startDate) " +
            "AND (:endDate IS NULL OR e.expenseDate <= :endDate) " +
            "AND (:paymentMethod IS NULL OR e.paymentMethod = :paymentMethod) " +
            "AND (:minAmount IS NULL OR e.amount >= :minAmount) " +
            "AND (:maxAmount IS NULL OR e.amount <= :maxAmount) " +
            "AND (:month IS NULL OR FUNCTION('MONTH', e.expenseDate) = :month) " +
            "AND (:year IS NULL OR FUNCTION('YEAR', e.expenseDate) = :year)")
    Page<Expense> filterExpenses(
            @Param("userId") Long userId,
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("paymentMethod") String paymentMethod,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            @Param("month") Integer month,
            @Param("year") Integer year,
            Pageable pageable
    );

    @Query("SELECT e FROM Expense e WHERE e.user.userId = :userId " +
            "AND (:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.notes) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:categoryId IS NULL OR e.category.categoryId = :categoryId) " +
            "AND (:startDate IS NULL OR e.expenseDate >= :startDate) " +
            "AND (:endDate IS NULL OR e.expenseDate <= :endDate) " +
            "AND (:paymentMethod IS NULL OR e.paymentMethod = :paymentMethod) " +
            "AND (:minAmount IS NULL OR e.amount >= :minAmount) " +
            "AND (:maxAmount IS NULL OR e.amount <= :maxAmount) " +
            "AND (:month IS NULL OR FUNCTION('MONTH', e.expenseDate) = :month) " +
            "AND (:year IS NULL OR FUNCTION('YEAR', e.expenseDate) = :year)")
    List<Expense> filterExpensesList(
            @Param("userId") Long userId,
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("paymentMethod") String paymentMethod,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            @Param("month") Integer month,
            @Param("year") Integer year
    );

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.userId = :userId")
    BigDecimal getTotalExpensesByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.userId = :userId AND e.expenseDate = :date")
    BigDecimal getDailyExpensesByUserId(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.userId = :userId AND FUNCTION('MONTH', e.expenseDate) = :month AND FUNCTION('YEAR', e.expenseDate) = :year")
    BigDecimal getMonthlyExpensesByUserId(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.userId = :userId AND e.category.categoryId = :categoryId AND FUNCTION('MONTH', e.expenseDate) = :month AND FUNCTION('YEAR', e.expenseDate) = :year")
    BigDecimal getMonthlyExpensesByUserIdAndCategory(@Param("userId") Long userId, @Param("categoryId") Long categoryId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT e.category.categoryName, SUM(e.amount) FROM Expense e WHERE e.user.userId = :userId GROUP BY e.category.categoryName ORDER BY SUM(e.amount) DESC")
    List<Object[]> getExpensesByCategoryGrouped(@Param("userId") Long userId);

    @Query("SELECT FUNCTION('MONTH', e.expenseDate), FUNCTION('YEAR', e.expenseDate), SUM(e.amount) FROM Expense e WHERE e.user.userId = :userId GROUP BY FUNCTION('YEAR', e.expenseDate), FUNCTION('MONTH', e.expenseDate) ORDER BY FUNCTION('YEAR', e.expenseDate) DESC, FUNCTION('MONTH', e.expenseDate) DESC")
    List<Object[]> getExpensesByMonthGrouped(@Param("userId") Long userId);

    @Query("SELECT FUNCTION('YEAR', e.expenseDate), SUM(e.amount) FROM Expense e WHERE e.user.userId = :userId GROUP BY FUNCTION('YEAR', e.expenseDate) ORDER BY FUNCTION('YEAR', e.expenseDate) DESC")
    List<Object[]> getExpensesByYearGrouped(@Param("userId") Long userId);

    List<Expense> findTop5ByUserUserIdOrderByExpenseDateDescExpenseIdDesc(Long userId);
}

package com.expensetracker.service;

import com.expensetracker.dto.ExpenseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseService {
    ExpenseDto createExpense(ExpenseDto expenseDto);
    ExpenseDto updateExpense(Long id, ExpenseDto expenseDto);
    ExpenseDto getExpenseById(Long id);
    Page<ExpenseDto> getAllExpenses(Pageable pageable);
    
    Page<ExpenseDto> getFilteredExpenses(
            String search,
            Long categoryId,
            LocalDate startDate,
            LocalDate endDate,
            String paymentMethod,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            Integer month,
            Integer year,
            Pageable pageable
    );

    List<ExpenseDto> getFilteredExpensesList(
            String search,
            Long categoryId,
            LocalDate startDate,
            LocalDate endDate,
            String paymentMethod,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            Integer month,
            Integer year
    );

    void deleteExpense(Long id);
}

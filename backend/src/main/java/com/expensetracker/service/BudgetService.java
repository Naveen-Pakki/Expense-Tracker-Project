package com.expensetracker.service;

import com.expensetracker.dto.BudgetDto;

import java.util.List;

public interface BudgetService {
    BudgetDto createOrUpdateBudget(BudgetDto budgetDto);
    List<BudgetDto> getCurrentUserBudgets(Integer month, Integer year);
    List<BudgetDto> getAllBudgetsForUser();
    BudgetDto getBudgetById(Long id);
    void deleteBudget(Long id);
}

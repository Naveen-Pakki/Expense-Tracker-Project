package com.expensetracker.service.impl;

import com.expensetracker.dto.BudgetDto;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.Budget;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.service.AuthService;
import com.expensetracker.service.BudgetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final AuthService authService;

    public BudgetServiceImpl(BudgetRepository budgetRepository,
                             CategoryRepository categoryRepository,
                             ExpenseRepository expenseRepository,
                             AuthService authService) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.expenseRepository = expenseRepository;
        this.authService = authService;
    }

    @Override
    @Transactional
    public BudgetDto createOrUpdateBudget(BudgetDto budgetDto) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        Category category = categoryRepository.findById(budgetDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", budgetDto.getCategoryId()));

        // Validate category accessibility
        if (category.getUser() != null && !category.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new BadRequestException("Invalid category selected.");
        }

        // Check if a budget already exists for this category, month, and year
        Optional<Budget> existingBudgetOpt = budgetRepository.findByUserUserIdAndCategoryCategoryIdAndMonthAndYear(
                currentUser.getUserId(),
                category.getCategoryId(),
                budgetDto.getMonth(),
                budgetDto.getYear()
        );

        Budget budget;
        if (existingBudgetOpt.isPresent()) {
            budget = existingBudgetOpt.get();
            budget.setAmount(budgetDto.getAmount());
        } else {
            budget = Budget.builder()
                    .category(category)
                    .amount(budgetDto.getAmount())
                    .month(budgetDto.getMonth())
                    .year(budgetDto.getYear())
                    .user(currentUser)
                    .build();
        }

        Budget savedBudget = budgetRepository.save(budget);
        return mapToDto(savedBudget);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetDto> getCurrentUserBudgets(Integer month, Integer year) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<Budget> budgets = budgetRepository.findByUserUserIdAndMonthAndYear(
                currentUser.getUserId(), month, year
        );
        return budgets.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetDto> getAllBudgetsForUser() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<Budget> budgets = budgetRepository.findByUserUserId(currentUser.getUserId());
        return budgets.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetDto getBudgetById(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));

        if (!budget.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new BadRequestException("You do not have permission to access this budget.");
        }

        return mapToDto(budget);
    }

    @Override
    @Transactional
    public void deleteBudget(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));

        if (!budget.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new BadRequestException("You do not have permission to delete this budget.");
        }

        budgetRepository.delete(budget);
    }

    private BudgetDto mapToDto(Budget budget) {
        // Calculate the actual spent amount for this category in this month and year
        BigDecimal spent = expenseRepository.getMonthlyExpensesByUserIdAndCategory(
                budget.getUser().getUserId(),
                budget.getCategory().getCategoryId(),
                budget.getMonth(),
                budget.getYear()
        );
        if (spent == null) {
            spent = BigDecimal.ZERO;
        }

        return BudgetDto.builder()
                .budgetId(budget.getBudgetId())
                .categoryId(budget.getCategory().getCategoryId())
                .categoryName(budget.getCategory().getCategoryName())
                .amount(budget.getAmount())
                .month(budget.getMonth())
                .year(budget.getYear())
                .userId(budget.getUser().getUserId())
                .spentAmount(spent)
                .isExceeded(spent.compareTo(budget.getAmount()) > 0)
                .build();
    }
}

package com.expensetracker.service.impl;

import com.expensetracker.dto.BudgetDto;
import com.expensetracker.dto.DashboardDto;
import com.expensetracker.dto.ExpenseDto;
import com.expensetracker.dto.ReportDto;
import com.expensetracker.entity.User;
import com.expensetracker.entity.Expense;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.service.AuthService;
import com.expensetracker.service.BudgetService;
import com.expensetracker.service.ReportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private final ExpenseRepository expenseRepository;
    private final BudgetService budgetService;
    private final AuthService authService;

    public ReportServiceImpl(ExpenseRepository expenseRepository,
                             BudgetService budgetService,
                             AuthService authService) {
        this.expenseRepository = expenseRepository;
        this.budgetService = budgetService;
        this.authService = authService;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardDto getDashboardData() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Long userId = currentUser.getUserId();
        LocalDate today = LocalDate.now();

        // 1. Fetch Aggregations
        BigDecimal total = expenseRepository.getTotalExpensesByUserId(userId);
        if (total == null) total = BigDecimal.ZERO;

        BigDecimal daily = expenseRepository.getDailyExpensesByUserId(userId, today);
        if (daily == null) daily = BigDecimal.ZERO;

        BigDecimal monthly = expenseRepository.getMonthlyExpensesByUserId(userId, today.getMonthValue(), today.getYear());
        if (monthly == null) monthly = BigDecimal.ZERO;

        // 2. Fetch Category Breakdown
        List<Object[]> categoryGrouped = expenseRepository.getExpensesByCategoryGrouped(userId);
        List<DashboardDto.CategoryBreakdown> breakdowns = new ArrayList<>();
        String highestCategory = "N/A";
        BigDecimal maxSpent = BigDecimal.ZERO;

        for (Object[] row : categoryGrouped) {
            String name = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            breakdowns.add(new DashboardDto.CategoryBreakdown(name, amount));

            if (amount.compareTo(maxSpent) > 0) {
                maxSpent = amount;
                highestCategory = name;
            }
        }

        // 3. Fetch Recent Transactions
        List<Expense> recentExpenses = expenseRepository.findTop5ByUserUserIdOrderByExpenseDateDescExpenseIdDesc(userId);
        List<ExpenseDto> recentDtos = recentExpenses.stream().map(this::mapExpenseToDto).collect(Collectors.toList());

        // 4. Fetch Active Budgets for the current month/year
        List<BudgetDto> budgets = budgetService.getCurrentUserBudgets(today.getMonthValue(), today.getYear());

        return DashboardDto.builder()
                .totalExpenses(total)
                .todayExpenses(daily)
                .monthlyExpenses(monthly)
                .highestCategory(highestCategory)
                .recentTransactions(recentDtos)
                .categoryBreakdowns(breakdowns)
                .activeBudgets(budgets)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReportDto getReportData() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Long userId = currentUser.getUserId();

        // 1. Fetch Monthly Summaries
        List<Object[]> monthlyGrouped = expenseRepository.getExpensesByMonthGrouped(userId);
        List<ReportDto.MonthlySummary> monthlySummaries = monthlyGrouped.stream().map(row -> {
            Integer month = ((Number) row[0]).intValue();
            Integer year = ((Number) row[1]).intValue();
            BigDecimal amount = (BigDecimal) row[2];
            return new ReportDto.MonthlySummary(month, year, amount);
        }).collect(Collectors.toList());

        // 2. Fetch Yearly Summaries
        List<Object[]> yearlyGrouped = expenseRepository.getExpensesByYearGrouped(userId);
        List<ReportDto.YearlySummary> yearlySummaries = yearlyGrouped.stream().map(row -> {
            Integer year = ((Number) row[0]).intValue();
            BigDecimal amount = (BigDecimal) row[1];
            return new ReportDto.YearlySummary(year, amount);
        }).collect(Collectors.toList());

        // 3. Fetch Category Summaries
        List<Object[]> categoryGrouped = expenseRepository.getExpensesByCategoryGrouped(userId);
        List<ReportDto.CategorySummary> categorySummaries = categoryGrouped.stream().map(row -> {
            String categoryName = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            return new ReportDto.CategorySummary(categoryName, amount);
        }).collect(Collectors.toList());

        return ReportDto.builder()
                .monthlySummaries(monthlySummaries)
                .yearlySummaries(yearlySummaries)
                .categorySummaries(categorySummaries)
                .build();
    }

    private ExpenseDto mapExpenseToDto(Expense expense) {
        return ExpenseDto.builder()
                .expenseId(expense.getExpenseId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .expenseDate(expense.getExpenseDate())
                .paymentMethod(expense.getPaymentMethod())
                .notes(expense.getNotes())
                .categoryId(expense.getCategory().getCategoryId())
                .categoryName(expense.getCategory().getCategoryName())
                .userId(expense.getUser().getUserId())
                .build();
    }
}

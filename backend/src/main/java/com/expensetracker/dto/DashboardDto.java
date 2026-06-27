package com.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDto {
    private BigDecimal totalExpenses;
    private BigDecimal todayExpenses;
    private BigDecimal monthlyExpenses;
    private String highestCategory;
    private List<ExpenseDto> recentTransactions;
    private List<CategoryBreakdown> categoryBreakdowns;
    private List<BudgetDto> activeBudgets;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private String categoryName;
        private BigDecimal totalAmount;
    }
}

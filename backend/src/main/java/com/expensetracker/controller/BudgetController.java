package com.expensetracker.controller;

import com.expensetracker.dto.BudgetDto;
import com.expensetracker.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<BudgetDto> createOrUpdateBudget(@Valid @RequestBody BudgetDto budgetDto) {
        BudgetDto result = budgetService.createOrUpdateBudget(budgetDto);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<BudgetDto>> getBudgets(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        List<BudgetDto> budgets;
        if (month != null && year != null) {
            budgets = budgetService.getCurrentUserBudgets(month, year);
        } else {
            budgets = budgetService.getAllBudgetsForUser();
        }
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetDto> getBudgetById(@PathVariable Long id) {
        BudgetDto budget = budgetService.getBudgetById(id);
        return ResponseEntity.ok(budget);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}

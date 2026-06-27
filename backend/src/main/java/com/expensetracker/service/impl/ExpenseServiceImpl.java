package com.expensetracker.service.impl;

import com.expensetracker.dto.ExpenseDto;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.service.AuthService;
import com.expensetracker.service.ExpenseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final AuthService authService;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository,
                              CategoryRepository categoryRepository,
                              AuthService authService) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.authService = authService;
    }

    @Override
    @Transactional
    public ExpenseDto createExpense(ExpenseDto expenseDto) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        // Fetch category
        Category category = categoryRepository.findById(expenseDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", expenseDto.getCategoryId()));

        // Validate category ownership (either system default or user's custom category)
        if (category.getUser() != null && !category.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new BadRequestException("Invalid category selected.");
        }

        Expense expense = Expense.builder()
                .title(expenseDto.getTitle().trim())
                .amount(expenseDto.getAmount())
                .expenseDate(expenseDto.getExpenseDate())
                .paymentMethod(expenseDto.getPaymentMethod())
                .notes(expenseDto.getNotes())
                .category(category)
                .user(currentUser)
                .build();

        Expense savedExpense = expenseRepository.save(expense);
        log.info("Expense created successfully: ID {}, User: {}", savedExpense.getExpenseId(), currentUser.getEmail());
        
        return mapToDto(savedExpense);
    }

    @Override
    @Transactional
    public ExpenseDto updateExpense(Long id, ExpenseDto expenseDto) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));

        // Ownership validation
        if (!expense.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new BadRequestException("You do not have permission to modify this expense.");
        }

        // Fetch and validate category
        Category category = categoryRepository.findById(expenseDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", expenseDto.getCategoryId()));

        if (category.getUser() != null && !category.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new BadRequestException("Invalid category selected.");
        }

        expense.setTitle(expenseDto.getTitle().trim());
        expense.setAmount(expenseDto.getAmount());
        expense.setExpenseDate(expenseDto.getExpenseDate());
        expense.setPaymentMethod(expenseDto.getPaymentMethod());
        expense.setNotes(expenseDto.getNotes());
        expense.setCategory(category);

        Expense updatedExpense = expenseRepository.save(expense);
        log.info("Expense updated successfully: ID {}", updatedExpense.getExpenseId());

        return mapToDto(updatedExpense);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseDto getExpenseById(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));

        if (!expense.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new BadRequestException("You do not have permission to view this expense.");
        }

        return mapToDto(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseDto> getAllExpenses(Pageable pageable) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Page<Expense> expenses = expenseRepository.findByUserUserId(currentUser.getUserId(), pageable);
        return expenses.map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseDto> getFilteredExpenses(
            String search,
            Long categoryId,
            LocalDate startDate,
            LocalDate endDate,
            String paymentMethod,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            Integer month,
            Integer year,
            Pageable pageable) {
        
        User currentUser = authService.getCurrentAuthenticatedUser();
        
        // Handle empty strings as nulls for JPQL mapping
        String searchStr = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String payMethod = (paymentMethod != null && !paymentMethod.trim().isEmpty()) ? paymentMethod.trim() : null;

        Page<Expense> filteredExpenses = expenseRepository.filterExpenses(
                currentUser.getUserId(),
                searchStr,
                categoryId,
                startDate,
                endDate,
                payMethod,
                minAmount,
                maxAmount,
                month,
                year,
                pageable
        );

        return filteredExpenses.map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseDto> getFilteredExpensesList(
            String search,
            Long categoryId,
            LocalDate startDate,
            LocalDate endDate,
            String paymentMethod,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            Integer month,
            Integer year) {

        User currentUser = authService.getCurrentAuthenticatedUser();
        
        String searchStr = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String payMethod = (paymentMethod != null && !paymentMethod.trim().isEmpty()) ? paymentMethod.trim() : null;

        List<Expense> list = expenseRepository.filterExpensesList(
                currentUser.getUserId(),
                searchStr,
                categoryId,
                startDate,
                endDate,
                payMethod,
                minAmount,
                maxAmount,
                month,
                year
        );

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteExpense(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));

        if (!expense.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new BadRequestException("You do not have permission to delete this expense.");
        }

        expenseRepository.delete(expense);
        log.info("Expense deleted: ID {}", id);
    }

    private ExpenseDto mapToDto(Expense expense) {
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

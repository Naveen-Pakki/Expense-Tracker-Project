package com.expensetracker.service.impl;

import com.expensetracker.dto.CategoryDto;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.service.AuthService;
import com.expensetracker.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuthService authService;

    public CategoryServiceImpl(CategoryRepository categoryRepository, AuthService authService) {
        this.categoryRepository = categoryRepository;
        this.authService = authService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<Category> categories = categoryRepository.findDefaultAndCustomCategories(currentUser.getUserId());
        return categories.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryDto createCategory(CategoryDto categoryDto) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        // Check if category name already exists as system or for this user (case-insensitive)
        if (categoryRepository.findByNameAndUserOrSystem(categoryDto.getCategoryName(), currentUser.getUserId()).isPresent()) {
            throw new BadRequestException("Category with name '" + categoryDto.getCategoryName() + "' already exists.");
        }

        Category category = Category.builder()
                .categoryName(categoryDto.getCategoryName().trim())
                .user(currentUser)
                .build();

        Category savedCategory = categoryRepository.save(category);
        return mapToDto(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        // Check if this user has permission to see it
        if (category.getUser() != null && !category.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new BadRequestException("You do not have permission to access this category.");
        }

        return mapToDto(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        // System categories cannot be deleted
        if (category.getUser() == null) {
            throw new BadRequestException("System default categories cannot be deleted.");
        }

        // Custom categories can only be deleted by the owner
        if (!category.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new BadRequestException("You do not have permission to delete this category.");
        }

        categoryRepository.delete(category);
    }

    private CategoryDto mapToDto(Category category) {
        return CategoryDto.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .isDefault(category.getUser() == null)
                .userId(category.getUser() != null ? category.getUser().getUserId() : null)
                .build();
    }
}

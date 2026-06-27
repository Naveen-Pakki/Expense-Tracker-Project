package com.expensetracker.config;

import com.expensetracker.entity.Category;
import com.expensetracker.repository.CategoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
public class CategoryInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public CategoryInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed default categories if none are present
        List<String> defaultCategoryNames = Arrays.asList(
                "Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Others"
        );

        for (String name : defaultCategoryNames) {
            if (categoryRepository.findByCategoryNameIgnoreCaseAndUserIsNull(name).isEmpty()) {
                Category category = Category.builder()
                        .categoryName(name)
                        .user(null) // null indicates system default category
                        .build();
                categoryRepository.save(category);
                log.info("Seeded default category: {}", name);
            }
        }
    }
}

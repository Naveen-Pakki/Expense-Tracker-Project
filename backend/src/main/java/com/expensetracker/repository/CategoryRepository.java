package com.expensetracker.repository;

import com.expensetracker.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Find all categories that are either system default (user is null) or custom for the user
    @Query("SELECT c FROM Category c WHERE c.user IS NULL OR c.user.userId = :userId")
    List<Category> findDefaultAndCustomCategories(@Param("userId") Long userId);

    List<Category> findByUserIsNull();

    List<Category> findByUserUserId(Long userId);

    Optional<Category> findByCategoryNameIgnoreCaseAndUserIsNull(String categoryName);

    Optional<Category> findByCategoryNameIgnoreCaseAndUserUserId(String categoryName, Long userId);

    @Query("SELECT c FROM Category c WHERE LOWER(c.categoryName) = LOWER(:categoryName) AND (c.user IS NULL OR c.user.userId = :userId)")
    Optional<Category> findByNameAndUserOrSystem(@Param("categoryName") String categoryName, @Param("userId") Long userId);
}

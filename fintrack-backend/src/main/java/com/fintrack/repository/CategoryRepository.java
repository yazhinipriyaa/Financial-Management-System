package com.fintrack.repository;

import com.fintrack.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdOrderByNameAsc(Long userId);
    List<Category> findByUserIdAndTypeOrderByNameAsc(Long userId, String type);
    boolean existsByNameAndUserIdAndType(String name, Long userId, String type);
}

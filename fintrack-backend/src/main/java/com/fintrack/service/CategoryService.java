package com.fintrack.service;

import com.fintrack.dto.CategoryDTO;
import com.fintrack.entity.Category;
import com.fintrack.entity.User;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<CategoryDTO> getUserCategories(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return categoryRepository.findByUserIdOrderByNameAsc(user.getId())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<CategoryDTO> getUserCategoriesByType(String email, String type) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return categoryRepository.findByUserIdAndTypeOrderByNameAsc(user.getId(), type)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (categoryRepository.existsByNameAndUserIdAndType(dto.getName(), user.getId(), dto.getType())) {
            throw new RuntimeException("Category with this name already exists");
        }

        Category category = Category.builder()
                .name(dto.getName())
                .type(dto.getType())
                .icon(dto.getIcon() != null ? dto.getIcon() : "📁")
                .color(dto.getColor() != null ? dto.getColor() : "#6366f1")
                .user(user)
                .build();

        category = categoryRepository.save(category);
        return mapToDTO(category);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        category.setName(dto.getName());
        category.setType(dto.getType());
        category.setIcon(dto.getIcon());
        category.setColor(dto.getColor());

        category = categoryRepository.save(category);
        return mapToDTO(category);
    }

    @Transactional
    public void deleteCategory(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        categoryRepository.delete(category);
    }

    private CategoryDTO mapToDTO(Category c) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setType(c.getType());
        dto.setIcon(c.getIcon());
        dto.setColor(c.getColor());
        return dto;
    }
}

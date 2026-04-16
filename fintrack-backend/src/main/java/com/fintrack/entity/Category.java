package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 10)
    private String type; // INCOME or EXPENSE

    @Column(length = 30)
    @Builder.Default
    private String icon = "📁";

    @Column(length = 7)
    @Builder.Default
    private String color = "#6366f1";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}

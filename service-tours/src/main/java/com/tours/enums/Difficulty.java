package com.tours.enums;

public enum Difficulty {
    EASY("Lako"),
    MEDIUM("Srednje"),
    HARD("Teško"),
    EXPERT("Ekspert");

    private final String displayName;

    Difficulty(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

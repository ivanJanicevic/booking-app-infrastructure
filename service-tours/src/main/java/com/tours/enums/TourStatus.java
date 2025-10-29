package com.tours.enums;

public enum TourStatus {
    DRAFT("Nacrt"),
    PUBLISHED("Objavljeno"),
    ARCHIVED("Arhivirano");

    private final String displayName;

    TourStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

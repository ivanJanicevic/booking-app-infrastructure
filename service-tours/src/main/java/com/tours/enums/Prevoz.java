package com.tours.enums;

public enum Prevoz {
    PESKE("Peške"),
    BICIKL("Biciklom"),
    AUTOMOBIL("Automobilom");

    private final String displayName;

    Prevoz(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}



package com.ecommerce.server.models.enums;

public enum Color {
    RED("#FF0000"),
    BLUE("#0000FF"),
    BLACK("#000000"),
    WHITE("#FFFFFF"),
    GREEN("#008000"),
    YELLOW("#FFFF00"),
    PINK("#FFC0CB"),
    GRAY("#808080"),
    BROWN("#A52A2A"),
    PURPLE("#800080"),
    ORANGE("#FFA500"),
    NAVY("#000080");

    private final String hexCode;

    Color(String hexCode) {
        this.hexCode = hexCode;
    }

    public String getHexCode() {
        return hexCode;
    }
}
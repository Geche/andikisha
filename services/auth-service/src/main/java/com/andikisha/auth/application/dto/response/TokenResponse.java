package com.andikisha.auth.application.dto.response;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,
        String tokenType,
        UserResponse user
) {
    public TokenResponse(String accessToken, String refreshToken,
                         long expiresIn, UserResponse user) {
        this(accessToken, refreshToken, expiresIn, "Bearer", user);
    }
}
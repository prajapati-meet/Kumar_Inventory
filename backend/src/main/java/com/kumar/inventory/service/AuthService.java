package com.kumar.inventory.service;

import com.kumar.inventory.dto.request.LoginRequest;
import com.kumar.inventory.dto.request.RefreshTokenRequest;
import com.kumar.inventory.dto.response.LoginResponse;
import com.kumar.inventory.entity.LoginHistory;
import com.kumar.inventory.entity.User;
import com.kumar.inventory.repository.LoginHistoryRepository;
import com.kumar.inventory.repository.UserRepository;
import com.kumar.inventory.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles authentication: login, JWT generation, token refresh, and audit logging.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final LoginHistoryRepository loginHistoryRepository;

    @Value("${jwt.access-token-expiry-ms}")
    private long accessTokenExpiryMs;

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        String username = request.getUsername();
        String ip = getClientIp(httpRequest);
        String ua = httpRequest.getHeader("User-Agent");

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.getPassword())
            );

            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User user = userRepository.findByUsername(username).orElseThrow();

            String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
            String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

            // Audit log — success
            saveLoginHistory(username, user.getRole().name(), "SUCCESS", ip, ua, null);

            log.info("User '{}' logged in successfully from {}", username, ip);

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .accessTokenExpiresIn(accessTokenExpiryMs)
                    .build();

        } catch (BadCredentialsException ex) {
            // Audit log — failure
            saveLoginHistory(username, "UNKNOWN", "FAILED", ip, ua, "Bad credentials");
            log.warn("Failed login attempt for user '{}' from {}", username, ip);
            throw ex;
        }
    }

    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        String username = jwtTokenProvider.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        User user = userRepository.findByUsername(username).orElseThrow();

        String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // reuse the existing refresh token
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .accessTokenExpiresIn(accessTokenExpiryMs)
                .build();
    }

    private void saveLoginHistory(String username, String role, String status, String ip, String ua, String reason) {
        loginHistoryRepository.save(LoginHistory.builder()
                .username(username)
                .role(role)
                .status(status)
                .ipAddress(ip)
                .userAgent(ua)
                .failureReason(reason)
                .build());
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

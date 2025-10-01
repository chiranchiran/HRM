package com.chiran.utils;

import com.chiran.properties.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * 生成Jwt
 */
public class JwtUtil {
    private RedisTemplate<String, String> redisTemplate;
    private JwtProperties jwtProperties;

    //属性注入
    public void setRedisTemplate(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void setJwtProperties(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    //生成 accessToken
    private String getAccessToken(String subject, Map<String, Object> claims) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getAccessToken().getExpiration());

        return Jwts.builder()
                .subject(subject)
                .claims(claims)
                .issuer(jwtProperties.getIssuer())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(jwtProperties.getAccessTokenPrivateKey())
                .compact();
    }

    //生成refreshToken
    private String getRefreshToken(String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getRefreshToken().getExpiration());

        Map<String, Object> claims = new HashMap<>();
        claims.put("tokenId", UUID.randomUUID().toString());

        return Jwts.builder()
                .subject(subject)
                .claims(claims)
                .issuer(jwtProperties.getIssuer())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(jwtProperties.getRefreshTokenPublicKey())
                .compact();
    }

    //token类
    @Data
    @AllArgsConstructor
    public class TokenPair {
        private final String accessToken;
        private final String refreshToken;
    }

    //生成双token,只用用户的id，不传入数据
    public TokenPair getTokenPair(String subject) {
        return getTokenPair(subject, new HashMap<>(), null);
    }

    //refresh后生成双token,不传入数据
    public TokenPair getTokenPair(String subject, Map<String, Object> claims) {
        return getTokenPair(subject, claims, null);
    }

    //refresh后生成双token,不传入数据
    public TokenPair getTokenPair(String subject, String oldTokenId) {
        return getTokenPair(subject, new HashMap<>(), oldTokenId);
    }

    //生成双token,传入数据
    public TokenPair getTokenPair(String subject, Map<String, Object> claims, String oldTokenId) {
        String accessToken = getAccessToken(subject, claims);
        String refreshToken = getRefreshToken(subject);

        //旧的refreshToken时效
        if (oldTokenId != "") invalidateRefreshToken(subject, oldTokenId);

        // 如果启用了Redis存储，保存Refresh Token
        if (isRedis()) {
            String tokenId = parseRefreshToken(refreshToken).get("tokenId", String.class);
            String refreshTokenKey = redisKey(subject, tokenId);
            redisTemplate.opsForValue().set(
                    refreshTokenKey,
                    refreshToken,
                    jwtProperties.getRefreshToken().getExpiration(),
                    TimeUnit.MILLISECONDS
            );
        }
        return new TokenPair(accessToken, refreshToken);
    }

    //解析accessToken
    public Claims parseAccessToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(jwtProperties.getAccessTokenPublicKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            throw new SecurityException(e.getMessage());
        }
    }

    public String getSubjectFromAccessToken(String token) {
        return parseAccessToken(token).getSubject();
    }

    //解析refreshToken
    public Claims parseRefreshToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(jwtProperties.getRefreshTokenPublicKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            throw new SecurityException(e.getMessage());
        }
    }

    public String getSubjectFromRefreshToken(String token) {
        return parseRefreshToken(token).getSubject();
    }

    // 验证accessToken本身
    public boolean validateAccessToken(String token) {
        try {
            parseAccessToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    //验证refreshToken本身是
    public boolean validateRefreshToken(String token) {
        try {
            parseRefreshToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    //刷新Access Token验证,先判断本身是否有效，然后判断在redis里是否有效
    public RefreshResult refreshTokens(String refreshToken) {
        if (!validateRefreshToken(refreshToken)) {
            return RefreshResult.invalid("Refresh token验证失败");
        }

        Claims claims = parseRefreshToken(refreshToken);
        String subject = claims.getSubject();
        String tokenId = claims.get("tokenId", String.class);

        // 验证Refresh Token是否在存储中
        if (isRedis()) {
            String storedToken = redisTemplate.opsForValue().get(
                    redisKey(subject, tokenId)
            );
            if (!refreshToken.equals(storedToken)) {
                return RefreshResult.invalid("Refresh token已失效");
            }
        }

        return RefreshResult.valid(subject, tokenId);
    }

    // Refresh结果封装类
    @Data
    @AllArgsConstructor
    public static class RefreshResult {
        private boolean valid;
        private String subject;
        private String tokenId;
        private String errorMessage;

        public static RefreshResult valid(String subject, String tokenId) {
            return new RefreshResult(true, subject, tokenId, null);
        }

        public static RefreshResult invalid(String errorMessage) {
            return new RefreshResult(false, null, null, errorMessage);
        }
    }

    // 使Refresh Token失效
    public void invalidateRefreshToken(String subject, String id) {
        if (isRedis()) {
            redisTemplate.delete(redisKey(subject, id));
        }
    }

    //从Authorization header中提取token
    public String getTokenFromHeader(String authorizationHeader) {
        if (StringUtils.hasText(authorizationHeader) &&
                authorizationHeader.startsWith(jwtProperties.getPrefix() + " ")) {
            return authorizationHeader.substring(jwtProperties.getPrefix().length() + 1);
        }
        return authorizationHeader;
    }

    // 清除用户的所有refreshToken（用于强制下线）
    public void invalidateAllUserTokens(String subject) {
        if (isRedis()) {
            String pattern = jwtProperties.getRedis().getKeyPrefix() + subject + ":*";
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        }
    }

    // 获取用户的有效token数量（用于设备数量限制）
    public int getUserActiveTokenCount(String subject) {
        if (isRedis()) {
            String pattern = jwtProperties.getRedis().getKeyPrefix() + subject + ":*";
            Set<String> keys = redisTemplate.keys(pattern);
            return keys != null ? keys.size() : 0;
        }
        return 0;
    }

    //验证redis是否使用
    private Boolean isRedis() {
        return jwtProperties.getRedis().isEnable() && redisTemplate != null;
    }

    //获得redis的key
    private String redisKey(String subject, String tokenId) {
        return jwtProperties.getRedis().getKeyPrefix() + subject + ":" + tokenId;
    }
}

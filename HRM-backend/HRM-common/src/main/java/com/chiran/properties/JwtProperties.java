package com.chiran.properties;

import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

/**
 * Jwt配置
 * secretKey
 * til
 * tokenName
 */
@Data
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String issuer;
    private String prefix;
    private TokenConfig accessToken;
    private TokenConfig refreshToken;
    private RedisConfig redis;

    private PrivateKey accessTokenPrivateKey;
    private PublicKey accessTokenPublicKey;
    private PublicKey refreshTokenPublicKey;

    @PostConstruct
    public void init() {
        try {
            // 加载密钥
            this.accessTokenPrivateKey = loadPrivateKey(accessToken.privatePath);
            this.accessTokenPublicKey = loadPublicKey(accessToken.publicPath);
            this.refreshTokenPublicKey = loadPublicKey(refreshToken.publicPath);
        } catch (Exception e) {
            throw new RuntimeException("加载JWT密钥失败", e);
        }
    }

    // 加载私钥
    private PrivateKey loadPrivateKey(String filename) throws Exception {
        byte[] keyBytes = Files.readAllBytes(Paths.get(filename));
        String privateKeyContent = new String(keyBytes)
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        byte[] decoded = java.util.Base64.getDecoder().decode(privateKeyContent);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(new PKCS8EncodedKeySpec(decoded));
    }

    // 加载公钥
    private PublicKey loadPublicKey(String filename) throws Exception {
        byte[] keyBytes = Files.readAllBytes(Paths.get(filename));
        String publicKeyContent = new String(keyBytes)
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");

        byte[] decoded = java.util.Base64.getDecoder().decode(publicKeyContent);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePublic(new X509EncodedKeySpec(decoded));
    }

    //token配置
    @Data
    public static class TokenConfig {
        private String header;
        private long expiration;
        private String privatePath;
        private String publicPath;
    }

    //redis配置
    @Data
    public static class RedisConfig {
        private boolean enable;
        private String keyPrefix;
    }
}

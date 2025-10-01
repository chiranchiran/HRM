package com.chiran.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Jwt配置
 * secretKey
 * til
 * tokenName
 */
@Component
@Data
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secretKey;
    private String issuer;
    private long til;
    private String tokenName;
}

package com.chiran.config;

import com.chiran.JwtProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Slf4j
@Configuration
public class CorsConfig {
    @Autowired
    JwtProperties jwtProperties;


    @Bean
    public CorsFilter corsFilter() {
        log.info("进入corsFilter");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // 设置允许的请求来源，生产环境建议设置为具体域名
        config.addAllowedOrigin("http://localhost:5173");
        // 允许的HTTP方法
        config.addAllowedMethod("*");
        // 允许的头部信息
        config.addAllowedHeader("*");
        // 允许携带凭证（如cookies）
        config.setAllowCredentials(true);
        // 预检请求的有效期，单位秒
        config.setMaxAge(3600L);

        // 特别关键：暴露给前端的响应头
        config.addExposedHeader(jwtProperties.getAccessToken().getHeader());
        config.addExposedHeader(jwtProperties.getRefreshToken().getHeader());

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}

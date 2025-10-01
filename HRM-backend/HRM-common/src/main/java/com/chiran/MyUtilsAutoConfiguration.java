package com.chiran;

import com.chiran.properties.JwtProperties;
import com.chiran.utils.JwtUtil;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;

@EnableConfigurationProperties({JwtProperties.class})
@Configuration
public class MyUtilsAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    public JwtUtil jwtUtil(JwtProperties jwtProperties, RedisTemplate<String, String> redisTemplate) {
        JwtUtil jwtUtil = new JwtUtil();
        jwtUtil.setJwtProperties(jwtProperties);
        jwtUtil.setRedisTemplate(redisTemplate);
        return jwtUtil;
    }
}

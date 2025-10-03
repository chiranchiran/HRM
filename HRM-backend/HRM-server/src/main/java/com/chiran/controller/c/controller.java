package com.chiran.controller.c;

import com.chiran.JwtUtil;
import com.chiran.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class controller {
    @Autowired
    private JwtUtil jwtUtil;
    @PostMapping("/api/login/count")
    public Result login(@RequestBody User user) {
        log.info("登录请求",user.getUsername());
        JwtUtil.TokenPair tokenPair = jwtUtil.getTokenPair(user.getUsername(), user.getPassword());
        return Result.success(tokenPair);
    }


}

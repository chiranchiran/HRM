package com.chiran.controller.c;

import com.chiran.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class controller {
    @Autowired
    private JwtUtil jwtUtil;

}

package com.chiran.handler;

import com.chiran.exception.BusinessException;
import com.chiran.result.Result;
import com.chiran.utils.ExceptionUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static Result<Object> resForSystem = Result.error(10000, ExceptionUtil.getMessage(10000));



    /**
     * 处理参数校验异常 - @RequestBody参数校验
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Object> handleMethodArgumentNotValidException(MethodArgumentNotValidException e,
                                                                        HttpServletRequest request) {
        String errorMessage = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        log.warn("参数校验失败 - 路径: {}, 错误: {}", request.getRequestURI(), errorMessage);

        return Result.error(10001, errorMessage);
    }

    /**
     * 处理参数校验异常 - @RequestParam参数校验
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public Result<Object> handleConstraintViolationException(ConstraintViolationException e,
                                                                     HttpServletRequest request) {
        String errorMessage = e.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining("; "));

        log.warn("参数校验失败 - 路径: {}, 错误: {}", request.getRequestURI(), errorMessage);

        return Result.error(10001, errorMessage);
    }

    /**
     * 处理参数绑定异常
     */
    @ExceptionHandler(BindException.class)
    public Result<Object> handleBindException(BindException e, HttpServletRequest request) {
        String errorMessage = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        log.warn("参数绑定失败 - 路径: {}, 错误: {}", request.getRequestURI(), errorMessage);

        return Result.error(10001, errorMessage);
    }

    /**
     * 处理参数类型不匹配异常
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public Result<Object> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e,
                                                                            HttpServletRequest request) {
        String errorMessage = String.format("参数 '%s' 类型不匹配，期望类型: %s",
                e.getName(), e.getRequiredType().getSimpleName());

        log.warn("参数类型不匹配 - 路径: {}, 错误: {}", request.getRequestURI(), errorMessage);

        return Result.error(10001, errorMessage);
    }

    /**
     * 处理缺少必要参数异常
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public Result<Object> handleMissingServletRequestParameterException(MissingServletRequestParameterException e,
                                                                                HttpServletRequest request) {
        String errorMessage = String.format("缺少必要参数: %s", e.getParameterName());

        log.warn("缺少必要参数 - 路径: {}, 错误: {}", request.getRequestURI(), errorMessage);

        return Result.error(10001, errorMessage);
    }

    /**
     * 处理404异常
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Object> handleNoHandlerFoundException(NoHandlerFoundException e, HttpServletRequest request) {
        log.warn("接口不存在 - 路径: {}, 方法: {}", request.getRequestURI(), e.getHttpMethod());

        return Result.error(10002, "请求的接口不存在");
    }

    /**
     * 处理JWT相关异常
     */
    @ExceptionHandler(JwtException.class)
    public ResponseEntity handleJwtException(JwtException e, HttpServletRequest request) {
        log.warn("JWT异常 - 路径: {}, 错误: {}", request.getRequestURI(), e.getMessage());
        return new ResponseEntity<>(null,HttpStatus.UNAUTHORIZED);
    }

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<Object> handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.warn("业务异常 - 路径: {}, 错误码: {}, 消息: {}",
                request.getRequestURI(), e.getCode(), e.getMessage());

        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理运行时的异常，主要是后端异常
     */
    @ExceptionHandler(RuntimeException.class)
    public Result<Object> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        log.error("运行时异常 - 路径: {}, 错误: {}", request.getRequestURI(), e.getMessage());
        return resForSystem;
    }

    /**
     * 处理所有未捕获的异常
     */
    @ExceptionHandler(Exception.class)
    public Result<Object> handleGlobalException(Exception e, HttpServletRequest request) {
        String path = request.getRequestURI();
        log.error("系统异常 - 路径: {}, 异常类型: {}, 错误消息: {}",
                path, e.getClass().getName(), e.getMessage(), e);
        return resForSystem;
    }
}
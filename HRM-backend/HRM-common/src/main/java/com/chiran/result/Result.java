package com.chiran.result;

import lombok.Data;

import java.io.Serializable;

/**
 * 后端返回的数据
 * code：0代表成功，其他错误代码有对应的message信息
 * message:成功信息统一为“成功”，失败的错误信息根据错误代码传入
 * data:传递给前端的具体数据
 */

@Data
public class Result<T> implements Serializable {
    private Integer code;
    private String message;
    private T data;

    public static <T> Result<T> success(){
        Result<T> result = new Result<>();
        result.code = 0;
        result.message = "成功";
        return result;
    }
    public static <T> Result<T> success(T data){
        Result<T> result = new Result<>();
        result.code = 0;
        result.message = "成功";
        return result;
    }
    public static <T> Result<T> error(Integer code,String message){
        Result<T> result = new Result<>();
        result.code = code;
        result.message = message;
        return result;
    }
}

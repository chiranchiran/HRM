import { logger } from "../../utils/logger"
import service from "../service"

//不同登录方式的接口
//账号登录
export const loginCount = (data) => {
  return service.post('/login/count', data)
}
//手机号登录
export const loginMobile = (data) => {
  return service.post('/login/mobile', data)
}
//自动登录
export const validate = (data) => {
  return service.post('/login/validate', data)
}
//refreshToken获得accessToken
export const refresh = (data) => {
  return service.post('/login/refresh', data)
}
//获取验证码
export const getCaptcha = (data) => {
  return service.post('/login/captcha', data)
}

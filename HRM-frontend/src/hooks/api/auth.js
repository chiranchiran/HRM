import { getCaptcha, loginCount, loginMobile, validate } from "../../api/modules/auth"
import { getLoginData } from "../../utils/localStorage"
import { useApi } from "../common/useApi"

export const useLoginByCount = (params, options = {}) => {
  return useApi(loginCount, {
    module: 'auth',
    apiName: 'login',
    params,
    isMutation: true,
    ...options
  })
}
export const useLoginByMobile = (params, options = {}) => {
  return useApi(loginMobile, {
    module: 'auth',
    apiName: 'login',
    params,
    isMutation: true,
    ...options
  })
}
export const useAutoLogin = (params, options = {}) => {
  const accessToken = getLoginData()[0]
  return useApi(validate, {
    module: 'auth',
    apiName: 'auto',
    params: { accessToken, ...params },
    isMutation: true,
    ...options
  })
}
export const useCaptcha = (params, options = {}) => {
  return useApi(getCaptcha, {
    module: 'auth',
    apiName: 'captcha',
    params,
    isMutation: true,
    ...options
  })
}
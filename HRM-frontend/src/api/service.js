import axios from "axios";
import { store } from "../store";
import { logout, refreshToken } from "../store/slices/authSlice";
import { logger } from "../utils/logger";
import { ErrorFactory } from "../utils/error/errorType";
import { getLoginData } from "../utils/localStorage";

const service = axios.create({
  baseURL: "/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json"
  }
})

//请求拦截器添加token
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    logger.info("token", token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    logger.debug('请求拦截诶器请求配置', {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data
    });
    return config
  },
  (error) => {
    logger.error('请求拦截器错误', {
      error: error.message,
      config: error.config,
    })
    return Promise.reject(error)
  }
)


// 响应拦截器处理所有请求的结果，包括成功、HTTP错误、业务错误、无响应错误
service.interceptors.response.use(
  (res) => {
    logger.debug('响应拦截器成功响应', {
      url: res.config.url,
      status: res.status,
      data: res.data
    })
    //处理业务错误，正确code为0
    if (res.data.code !== 0) {
      const error = ErrorFactory.business(res.data, res)
      logger.error(res.data.message || error.message, error)
      return Promise.reject(error)
    }
    //成功
    logger.debug("无业务错误")
    return res.data.data
  },
  async (error) => {
    logger.debug("请求错误进入响应拦截器", error)
    const originalRequest = error.config
    //处理无响应
    if (!error.response) {
      logger.debug("处理无响应错误")
      return handleNetworkError(error, originalRequest)
    }
    //处理http错误
    logger.debug("处理http错误")
    return handleHttpError(error, originalRequest)
  }
)
//处理无响应错误
const handleNetworkError = (error, originalRequest) => {
  const errorInfo = {
    url: originalRequest?.url,
    method: originalRequest?.method,
    baseURL: originalRequest?.baseURL,
    timeout: originalRequest?.timeout,
    originalError: error.message,
    code: error.code
  };

  let networkError;

  // 1. 请求超时
  if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
    networkError = ErrorFactory.network('TIMEOUT_ERROR', `请求超时（${originalRequest?.timeout}ms）`, {
      ...errorInfo,
      timeout: originalRequest?.timeout
    });
    logger.warn('请求超时', networkError);
  }
  // 2. 网络断开
  else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
    networkError = ErrorFactory.network('NETWORK_OFFLINE', undefined, {
      ...errorInfo,
      isOnline: navigator.onLine
    });
    logger.error('网络断开', networkError);
  }
  // 3. CORS 跨域错误
  else if (error.code === 'ERR_NETWORK' && error.message.includes('CORS')) {
    networkError = ErrorFactory.network('CORS_ERROR', undefined, {
      ...errorInfo,
      suggestion: '请检查服务器CORS配置'
    });
    logger.error('跨域错误', networkError);
  }
  // 4. 服务器无法连接（域名解析失败、服务器宕机等）
  else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
    networkError = ErrorFactory.network('SERVER_UNREACHABLE', undefined, {
      ...errorInfo,
      suggestion: '请检查服务器状态或网络连接'
    });
    logger.error('服务器无法连接', networkError);
  }
  // 5. 其他未知网络错误
  else {
    networkError = ErrorFactory.network('UNKNOWN_NETWORK_ERROR', '网络错误，请检查网络连接', errorInfo);
    logger.error('未知网络错误', networkError);
  }

  return Promise.reject(networkError);
};

//处理HTTP错误（有响应但状态码错误）
const handleHttpError = (error, originalRequest) => {
  const { status, data } = error.response;
  const errorInfo = {
    url: originalRequest?.url,
    method: originalRequest?.method,
    status: status,
    data: data
  };

  // 处理401
  if (status === 401) {
    logger.debug("处理401错误")
    return handleAuthError(originalRequest, error.response);
  }

  let appError
  // 优先使用业务错误码
  if (data?.code) {
    appError = ErrorFactory.business(data, errorInfo);
  } else {
    appError = ErrorFactory.http(status, data?.message, errorInfo);
  }
  logErrorByType(appError, errorInfo);
  return Promise.reject(appError);
};

//根据错误级别记录日志
const logErrorByType = (error, errorInfo) => {
  const message = () => {
    switch (error.type) {
      case 'SERVER_ERROR':
        return '服务器错误'
      case 'CLIENT_ERROR':
        return '客户端错误'
      case 'REDIRECT':
        return '重定向或信息类错误'
      default:
        return '未知级别错误'
    }
  }
  logger[error.level](message(), errorInfo)
};

//防止多个请求401并发刷新，由于refresh都是dispatch的，不受react Query管理并发
let refreshing = null
// 401错误
const handleAuthError = async (config, errorInfo) => {
  //refresh本身失败死循环、单个请求重复重试
  const authError = ErrorFactory.business({ code: 11000 }, errorInfo)
  if (config.url.includes('/login/refresh') || config._retry) {
    logger.warn('刷新token已经失败或这个请求已重试过，直接退出登录', errorInfo)
    store.dispatch(logout())
    return Promise.reject(authError)
  }
  logger.warn('401请求错误，尝试刷新token', errorInfo);
  //检查是否有refreshToken
  const { refreshToken } = getLoginData()
  if (!refreshToken) {
    return Promise.reject(ErrorFactory.business({ code: 11001 }))
  }

  config._retry = true
  try {
    if (!refreshing) {
      refreshing = store.dispatch(refreshToken()).unwrap()
      logger.warn('开始刷新token');
    }
    await refreshing
    const { accessToken } = getLoginData()
    logger.info('刷新token成功', accessToken)
    config.headers.Authorization = `Bearer ${accessToken}`
    return service(config)
  } catch (e) {
    logger.warn('刷新token失败', e.message);
    store.dispatch(logout())
    return Promise.reject(authError)
  } finally {
    refreshing = null
  }
}
export default service
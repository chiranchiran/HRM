import { HTTP_ERROR_MAP, BUSINESS_ERROR_MAP, NETWORK_ERROR_MAP } from './errorMaps';

//错误基类
export class AppError extends Error {
  constructor(message, config, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.type = config.type;
    this.level = config.level
    this.details = details;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

//HTTP 错误
export class HttpError extends AppError {
  constructor(statusCode, customMessage, details = {}) {
    const errorConfig = HTTP_ERROR_MAP[statusCode] || HTTP_ERROR_MAP[500];
    const message = customMessage || errorConfig.message;
    super(message, errorConfig, details);
    this.statusCode = statusCode;
  }
}

//业务错误类
export class BusinessError extends AppError {
  constructor(businessCode, customMessage, details = {}) {
    const errorConfig = BUSINESS_ERROR_MAP[businessCode] || BUSINESS_ERROR_MAP[10000];
    const message = customMessage || errorConfig.message;
    super(message, errorConfig, details);
    this.businessCode = businessCode;
  }
}

//网络错误类
export class NetworkError extends AppError {
  constructor(errorType = 'NETWORK_ERROR', customMessage, details = {}) {
    const errorConfig = NETWORK_ERROR_MAP[errorType] || NETWORK_ERROR_MAP.NETWORK_ERROR;
    const message = customMessage || errorConfig.message;
    super(message, errorConfig, details);
  }
}

//错误工厂
export class ErrorFactory {

  static http(statusCode, customMessage, details = {}) {
    return new HttpError(statusCode, customMessage, details);
  }

  static business(data, details = {}) {
    return new BusinessError(data.code, data?.message, { data, details });
  }

  static network(errorType = 'NETWORK_ERROR', customMessage = undefined, details = {}) {
    return new NetworkError(errorType, customMessage, details);
  }

  //更新错误映射
  static updateMaps(newHttpMap, newBusinessMap, newNetworkMap) {
    if (newHttpMap) Object.assign(HTTP_ERROR_MAP, newHttpMap);
    if (newBusinessMap) Object.assign(BUSINESS_ERROR_MAP, newBusinessMap);
    if (newNetworkMap) Object.assign(NETWORK_ERROR_MAP, newNetworkMap);
  }
}
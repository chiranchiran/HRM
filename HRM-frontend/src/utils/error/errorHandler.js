import { logger } from "../logger";
import { logout } from "../../store/slices/authSlice";

// 全局错误处理
export const handleGlobalError = () => {
  // 捕获 JS 运行时错误
  window.addEventListener('error', event => {
    logger.error("全局错误", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack
    });
  });

  // 捕获 React 组件错误及事件监听器错误
  if (typeof window !== 'undefined' && window.addEventListener) {
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = (type, listener, options) => {
      const wrappedListener = (...args) => {
        try {
          return listener(...args);
        } catch (error) {
          logger.error('事件监听器错误', {
            type,
            error: error.message,
            stack: error.stack
          });
          throw error; // 继续抛出错误，让其他错误处理机制也能捕获
        }
      };
      return originalAddEventListener.call(window, type, wrappedListener, options);
    };
  }
}
//处理数据层Promise错误
export function handlePromiseError(error, notification, messageApi, navigate) {
  if (!error) return
  const { type, level = 'error', message, details } = error
  //区分不同类型处理
  switch (type) {
    case 'REDIRECT':
      return
    case 'CLIENT_ERROR':
    case 'SYSTEM_ERROR':
      notification[error.level]({ message: "请求错误！", description: error.message })
      break
    case 'SERVER_ERROR':
      notification.error({ message: "服务器错误！", description: error.message })
      break
    case 'NETWORK_ERROR':
      notification.error({ message: "网络错误！", description: error.message })
      break;
    case 'AUTH_ERROR':
      handleAuthError(error, notification);
      break;
    case 'USER_ERROR':
      notification.error({ message: "登录错误！", description: error.message })
      break;
    case 'VALIDATION_ERROR':
    case 'BUSINESS_ERROR':
    case 'ORDER_ERROR':
      messageApi.error(error.message, navigate)
      break;
    case 'PAYMENT_ERROR':
      notification.error({ message: "支付失败！", description: error.message })
      break
    default:
      notification.error({ message: "未知错误！", description: error.message })
  }
}
function handleAuthError(error, notification, navigate) {
  const { code } = error;
  if (code === 11000 || 11002) {
    store.dispatch(logout())
    // 跳转到登录页
    setTimeout(() => {
      navigate('/login')
    }, 1000);
  }
  //11003逻辑
  notification.error({ message: "未知错误！", description: error.message })
}
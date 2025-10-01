import { createContext, useContext } from 'react';
import { message, notification } from 'antd';

const MessageContext = createContext(null);
const NotificationContext = createContext(null);

// 包装 Notification,自动注入自定义样式 + 合并全局配置
const wrapNotification = (nativeNotificationApi, globalDefaultConfig = {}) => {
  const notificationTypes = ['success', 'info', 'warning', 'error'];

  // 基础默认配置
  const baseDefaultConfig = {
    className: 'ant-notification-notice-custom',
    duration: 300,
    placement: 'topRight',
    ...globalDefaultConfig,
  };

  // 遍历类型，包装每个通知方法
  const wrappedApi = notificationTypes.reduce((api, type) => {
    api[type] = (args) => {
      const finalConfig = {
        ...baseDefaultConfig,
        ...args,
        className: args.className
          ? `${baseDefaultConfig.className} ${args.className}`
          : baseDefaultConfig.className,
      };
      return nativeNotificationApi[type](finalConfig);
    };
    return api;
  }, {});

  // 保留原生 open/close/destroy 方法
  return {
    ...wrappedApi,
    open: (args) => {
      const finalConfig = {
        ...baseDefaultConfig,
        ...args,
        className: args.className
          ? `${baseDefaultConfig.className} ${args.className}`
          : baseDefaultConfig.className,
      };
      return nativeNotificationApi.open(finalConfig);
    },
    close: nativeNotificationApi.close,
    destroy: nativeNotificationApi.destroy,
  };
};

// 3. 包装 Message 方法
const wrapMessage = (nativeMessageApi, globalDefaultConfig = {}) => {
  const messageTypes = ['success', 'info', 'warning', 'error', 'loading'];

  // 基础默认配置
  const baseDefaultConfig = {
    duration: 2,
    ...globalDefaultConfig,
  };

  // 遍历类型，包装每个 Message 方法
  const wrappedApi = messageTypes.reduce((api, type) => {
    api[type] = (content, args = {}) => {
      const finalConfig = { ...baseDefaultConfig, ...args };
      if (type === 'loading') {
        return nativeMessageApi[type](content, finalConfig.duration, finalConfig.onClose);
      }
      return nativeMessageApi[type](content, finalConfig);
    };
    return api;
  }, {});

  // 保留原生 open/destroy 方法
  return {
    ...wrappedApi,
    open: (args) => nativeMessageApi.open({ ...baseDefaultConfig, ...args }),
    destroy: nativeMessageApi.destroy,
  };
};

export const MessageProvider = ({ children, config = {} }) => {
  const [nativeMessageApi, messageHolder] = message.useMessage();
  const [nativeNotificationApi, notificationHolder] = notification.useNotification();

  const wrappedMessageApi = wrapMessage(nativeMessageApi, config.defaultMessageConfig);
  const wrappedNotificationApi = wrapNotification(nativeNotificationApi, config.defaultNotificationConfig);

  return (
    <NotificationContext.Provider value={wrappedNotificationApi}>
      <MessageContext.Provider value={wrappedMessageApi}>
        {notificationHolder}
        {messageHolder}
        {children}
      </MessageContext.Provider>
    </NotificationContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('❌ useMessage 必须在 MessageProvider 内部使用');
  }
  return context;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('❌ useNotification 必须在 MessageProvider 内部使用');
  }
  return context;
};
import { getApiConfig } from "../../api/config"
import { useMutation, useQuery } from "@tanstack/react-query"
import queryClient from "../../api/queryClient"
import { logger } from "../../utils/logger"
import { useMessage, useNotification } from "./useMessage"
import { handlePromiseError } from "../../utils/error/errorHandler"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
export const useApi = (apiFunc, {
  module,
  apiName,
  enabled = true,
  onSuccess: apiOnSuccess,
  onError: apiOnError,
  params = null,
  isMutation = false
}) => {
  //获取api配置
  const messageApi = useMessage()
  const notification = useNotification()
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const successConfig = getApiConfig(module, apiName, 'success')
  const errorConfig = getApiConfig(module, apiName, 'error')

  //默认成功处理
  const defaultOnSuccess = (data) => {
    //全局成功处理
    logger.debug("请求成功")
    //配置文件handler
    const handler = successConfig.handler
    if (handler && typeof handler === 'function') {
      logger.debug("成功handler开始执行", data)
      handler(data, dispatch, navigate)
    }
    //提示成功消息
    if (successConfig.showMessage) {
      notification.success({ message: successConfig.message, description: "欢迎使用HRM~" })
    }
    //刷新缓存
    handleCacheUpdate(module, apiName, data);
  }
  const handleCacheUpdate = (module, operation, data) => {
    /**queryKey的形式
     * user: {
        list: (params) => ['users', 'list', params],
        detail: (id) => ['users', 'detail', id]}
     */
    const byModule = (module, operation, params = null) => {
      const baseKey = [module, operation];
      return params ? [...baseKey, params] : baseKey;
    }
    const cacheUpdateStrategies = {
      // 定义不同操作对应的缓存更新策略
      'create': () => {
        queryClient.invalidateQueries({
          queryKey: byModule(module, 'list')
        });
      },
      'update': () => {
        const id = data?.id;
        if (id) {
          queryClient.invalidateQueries({
            queryKey: byModule(module, 'detail', id)
          });
        }
        queryClient.invalidateQueries({
          queryKey: byModule(module, 'list')
        });
      },
      'delete': () => {
        queryClient.invalidateQueries({
          queryKey: byModule(module, 'list')
        });
        queryClient.removeQueries({
          queryKey: byModule(module, 'detail', id)
        })

      }
    };
    Object.keys(cacheUpdateStrategies).forEach(key => {
      if (operation.includes(key)) {
        cacheUpdateStrategies[key]();
      }
    });
  };
  //默认错误处理
  const defaultOnError = (error) => {
    //根据拦截器返回的自定义error分别处理
    handlePromiseError(error, notification, messageApi, navigate)
    //配置文件handler
    const handler = errorConfig.handler
    if (handler && typeof handler === 'function') {
      logger.debug("失败handler开始执行", error)
      handler(error, dispatch, navigate)
    }
    //错误消息显示
    if (errorConfig.showMessage) {
      showError(error)
    }
  }
  // 根据错误级别显示不同提示
  function showError(error) {
    const { message, level = 'error' } = error
    switch (level) {
      case 'warn':
        messageApi.warning({ message })
        break
      case 'info':
        messageApi.info({ message })
        break
      default:
        messageApi.error({ message })
    }
  }
  const handleSuccess = (data) => {
    logger.debug("成功onsuccess开始执行", data)
    defaultOnSuccess(data);
    if (apiOnSuccess && typeof apiOnSuccess === 'function') {
      logger.debug("自定义成功onsuccess开始执行", data)
      apiOnSuccess(data);
    }
  };

  const handleError = (error) => {
    logger.debug("失败onerror开始执行", error)
    defaultOnError(error);
    if (apiOnError && typeof apiOnError === 'function') {
      logger.debug("自定义失败onerror开始执行", error)
      apiOnError(error);
    }
  };
  const requestResult = isMutation
    ? useMutation({
      mutationFn: (params) => apiFunc(params),
      onSuccess: handleSuccess,
      onError: handleError
    })
    : useQuery({
      queryKey: [module, apiName, params],
      queryFn: () => apiFunc(params),
      enabled,
      onSuccess: handleSuccess,
      onError: handleError
    });
  return {
    ...requestResult,
    handleSuccess,
    handleError
  };

}
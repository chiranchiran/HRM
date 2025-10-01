// HTTP错误
export const HTTP_ERROR_MAP = {
  // 3xx
  300: { type: 'REDIRECT', level: 'info', message: '重定向错误' },
  301: { type: 'REDIRECT', level: 'info', message: '资源已永久移动' },
  302: { type: 'REDIRECT', level: 'info', message: '资源临时移动' },
  304: { type: 'REDIRECT', level: 'info', message: '资源未修改' },

  // 4xx 
  400: { type: 'CLIENT_ERROR', level: 'error', message: '请求参数错误' },
  401: { type: 'CLIENT_ERROR', level: 'error', message: '未授权访问' },
  403: { type: 'CLIENT_ERROR', level: 'error', message: '权限不足' },
  404: { type: 'CLIENT_ERROR', level: 'error', message: '请求的资源不存在' },
  409: { type: 'CLIENT_ERROR', level: 'error', message: '资源冲突' },
  429: { type: 'CLIENT_ERROR', level: 'warn', message: '请求过于频繁' },

  // 5xx 
  500: { type: 'SERVER_ERROR', level: 'error', message: '服务器错误' },
  502: { type: 'SERVER_ERROR', level: 'error', message: '网关错误' },
  503: { type: 'SERVER_ERROR', level: 'error', message: '服务暂时不可用' },
  504: { type: 'SERVER_ERROR', level: 'error', message: '网关超时' }
};

// 业务错误映射表（
export const BUSINESS_ERROR_MAP = {
  // 全局错误 (10000-10999)
  10000: { type: 'SYSTEM_ERROR', level: 'error', message: '系统繁忙，请稍后重试' },
  10001: { type: 'SYSTEM_ERROR', level: 'error', message: '请求参数不正确，请检查后重试' },
  10002: { type: 'SYSTEM_ERROR', level: 'error', message: '您访问的内容不存在' },
  10003: { type: 'SYSTEM_ERROR', level: 'error', message: '系统维护中，请稍后访问' },

  // 认证与授权 (11000-11999)
  11000: { type: 'AUTH_ERROR', level: 'error', message: '登录已失效，请重新登录' },
  11001: { type: 'AUTH_ERROR', level: 'error', message: '您没有权限执行此操作' },
  11002: { type: 'AUTH_ERROR', level: 'error', message: '请先登录' },
  11003: { type: 'AUTH_ERROR', level: 'error', message: '登录失败次数过多，请30分钟后重试' },

  // 用户模块 (12000-12999)
  12000: { type: 'USER_ERROR', level: 'error', message: '用户不存在，请重新输入' },
  12001: { type: 'USER_ERROR', level: 'error', message: '密码错误，请重新输入' },
  12002: { type: 'USER_ERROR', level: 'error', message: '该用户名已被占用' },
  12003: { type: 'USER_ERROR', level: 'error', message: '该手机号已注册，请直接登录' },
  12004: { type: 'USER_ERROR', level: 'error', message: '验证码错误或已过期' },
  12005: { type: 'USER_ERROR', level: 'error', message: '账户已被锁定，请联系管理员' },

  // 数据验证 (13000-13999)
  13000: { type: 'VALIDATION_ERROR', level: 'error', message: '请输入有效的邮箱地址' },
  13001: { type: 'VALIDATION_ERROR', level: 'error', message: '请输入有效的手机号' },
  13002: { type: 'VALIDATION_ERROR', level: 'error', message: '密码需包含大小写字母和数字' },
  13003: { type: 'VALIDATION_ERROR', level: 'error', message: '日期格式应为YYYY-MM-DD' },

  // 业务逻辑 (14000-14999)
  14000: { type: 'BUSINESS_ERROR', level: 'error', message: '库存不足，请调整购买数量' },
  14001: { type: 'BUSINESS_ERROR', level: 'error', message: '该优惠券已失效' },
  14002: { type: 'BUSINESS_ERROR', level: 'error', message: '订单已进入配送阶段，无法取消' },
  14003: { type: 'BUSINESS_ERROR', level: 'error', message: '您已提交过相同订单' },

  // 订单模块 (15000-15999)
  15000: { type: 'ORDER_ERROR', level: 'error', message: '未找到相关订单信息' },
  15001: { type: 'ORDER_ERROR', level: 'error', message: '支付超时，请重新下单' },
  15002: { type: 'ORDER_ERROR', level: 'error', message: '订单状态已更新，请刷新页面' },

  // 支付模块 (16000-16999)
  16000: { type: 'PAYMENT_ERROR', level: 'error', message: '支付失败，请检查支付方式' },
  16001: { type: 'PAYMENT_ERROR', level: 'error', message: '暂不支持该支付渠道' },
  16002: { type: 'PAYMENT_ERROR', level: 'error', message: '支付金额与订单金额不一致' }
};

// 网络错误映射
export const NETWORK_ERROR_MAP = {
  // 基本网络错误
  NETWORK_ERROR: { type: 'NETWORK_ERROR', level: 'error', message: '网络连接错误，请检查网络设置' },
  TIMEOUT_ERROR: { type: 'NETWORK_ERROR', level: 'warn', message: '请求超时，请稍后重试' },

  // 具体网络错误类型
  NETWORK_OFFLINE: { type: 'NETWORK_ERROR', level: 'error', message: '网络连接已断开，请检查网络设置' },
  CORS_ERROR: { type: 'NETWORK_ERROR', level: 'error', message: '跨域请求被阻止' },
  SERVER_UNREACHABLE: { type: 'NETWORK_ERROR', level: 'error', message: '无法连接到服务器' },
  DNS_RESOLVE_FAILED: { type: 'NETWORK_ERROR', level: 'error', message: '域名解析失败' },
  SSL_ERROR: { type: 'NETWORK_ERROR', level: 'error', message: 'SSL证书错误' },
  UNKNOWN_NETWORK_ERROR: { type: 'NETWORK_ERROR', level: 'error', message: '未知网络错误' }
};
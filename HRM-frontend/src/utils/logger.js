import { LOGS_URL, logs, logsFetch } from "../api/modules/logs"
import service from "../api/service"


//错误级别
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
}
//不同环境下日志输出级别
const getLogLevel = () => {
  if (process.env.NODE_ENV === 'development') {
    return LogLevel.DEBUG
  }
  return LogLevel.ERROR
}

let currentLogLevel = getLogLevel()
//日志核心类
class Logger {
  constructor() {
    this.queue = []
    this.maxLength = 50
    this.isSending = false
    this.sendInterval = 3000000
    this.addContext = null
    this.url = LOGS_URL
    //定时发送，页面卸载前发送所有日志
    setInterval(() => this.flush(), this.sendInterval)
    window.addEventListener('beforeunload', () => {
      this.flushSync()
    })
  }
  //设置日志用户信息
  setUserContext(id, username) {
    this.userContext = { id, username }
  }
  //一些其他想信息
  addContext(key, value) {
    this.addContext[key] = value
  }
  //记录日志
  log(level, message, data) {
    if (level < currentLogLevel) {
      return
    }
    //具体日志结构
    const logEntry = {
      //UTC时间
      time: new Date().toISOString(),
      level: Object.keys(LogLevel).find(key => LogLevel[key] === level),
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...this.userContext,
      ...this.addContext
    }
    //开发环境直接输出控制台
    if (process.env.NODE_ENV === 'development') {
      const method = level
        === LogLevel.ERROR ? 'error' :
        level === LogLevel.WARN ? 'warn' :
          level === LogLevel.INFO ? 'info' : 'log'

      console[method](`[${logEntry.level}] ${message}`, data)
    }
    //生产环境添加到队列
    this.queue.push(logEntry)
    //队列满了立马发送
    if (this.queue.length >= this.maxLength) {
      this.flush()
    }
  }
  //发送日志
  async flush() {
    if (this.isSending || this.queue.length === 0) {
      return
    }
    //复制当前日志，防止堵塞后续日志
    this.isSending = true
    const logsQueue = [...this.queue]
    this.queue = []

    //优先使用axios，fetch兜底
    try {
      if (window.service) {
        await logs(logsQueue)
        this.info("同步日志axios发送成功")
      } else {
        this.info("axios不存在，fetch发送")
        await logsFetch(logsQueue)
        this.info("同步日志axios发送成功")
      }
    } catch (e) {
      console.error('平时日志发送失败', e)
    } finally {
      this.isSending = false
    }
  }
  //页面卸载前sendBeacon可靠发送+fetch+XHR保底
  flushSync() {

    if (this.queue.length === 0) {
      return;
    }

    const logsToSend = [...this.queue];
    this.queue = [];

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(logsToSend)], {
        type: 'application/json'
      });
      const flag = navigator.sendBeacon(this.url, blob);
      if (flag) {
        this.info("页面卸载前日志通过sendBeacon发送成功")
        return
      }
      this.warn("sendBeason发送失败")
    }
    try {
      logsFetch(logsToSend)
        .catch(e => {
          this.warn('fetch+keepalive 发送失败，尝试最终兜底方案')
          try {
            // 同步XMLHttpRequest作为最后手段
            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.url, false);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(logsToSend));
            this.info('同步XHR日志发送成功')
            return
          } catch (e) {
            this.warn('同步XHR发送方案均失败:', e)
          }
        })
    } catch (e) {
      this.warn('所有日志发送方案均失败:', e)
    }
  }
  //便捷方法
  debug(message, data = null) {
    this.log(LogLevel.DEBUG, message, data)
  }
  info(message, data = null) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message, data = null) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message, data = null) {
    this.log(LogLevel.ERROR, message, data);
  }

  critical(message, data = null) {
    this.log(LogLevel.CRITICAL, message, data);
  }

}
export const logger = new Logger();
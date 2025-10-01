import service from "../service"

export const LOGS_URL = '/api/logs'

export const logs = (data) => {
  return service.post(LOGS_URL.substring(3), data, keepalive = true)
}

export const logsFetch = (data) => {
  return fetch('/api/logs,', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
    timeout: 5000,
    keepalive: true,
    mode: 'cors'
  })
}


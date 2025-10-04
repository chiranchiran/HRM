/**
 * 本地存储
 * accessToken
 * refreshToken
 * id
 * uername
 * role
 * rememberMe
 * autoLoginExpire
 * isAuthenticated
*/
export const defaultAutoLogin = 30 * 24 * 60 * 60 * 1000
//设置、删除、获取登录数据
export const setLoginData = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem("accessToken", JSON.stringify(accessToken))
  if (refreshToken) localStorage.setItem("refreshToken", JSON.stringify(refreshToken))
}
export const removeLoginData = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
}
export const getLoginData = () => {
  return {
    accessToken: JSON.parse(localStorage.getItem("accessToken")),
    refreshToken: JSON.parse(localStorage.getItem("refreshToken"))
  } || {}
}

//设置、删除、获取用户数据
export const setUserData = user => {
  localStorage.setItem('userInfo', JSON.stringify({
    username: user?.username || null,
    id: user?.id || null,
    role: user?.role || null,
    rememberMe: null,
    autoLoginExpire: null,
    isAuthenticated: user?.isAuthenticated || false
  }))
}
export const removeUserData = () => {
  localStorage.removeItem("userInfo")
}
export const getUserData = () => {
  return JSON.parse(localStorage.getItem("userInfo")) || {}
}
//修改认证状态
export const setAuthenticated = isAuthenticated => {
  const userInfo = getUserData()
  userInfo.isAuthenticated = isAuthenticated
  setUserData(userInfo)
}
//修改登录状态
export const setAutoLoginData = (rememberMe, autoLoginExpire) => {
  const userInfo = getUserData()
  if (rememberMe) userInfo.rememberMe = rememberMe
  if (autoLoginExpire) {
    userInfo.autoLoginExpire = autoLoginExpire
  } else {
    const expireTime = Date.now() + defaultAutoLogin;
    userInfo.autoLoginExpire = expireTime
  }
  setUserData(userInfo)
}

//设置、查询、删除所有数据
export const setAllData = data => {
  const { accessToken, refreshToken, userInfo } = data
  setLoginData(accessToken, refreshToken)
  setUserData(userInfo)
}
export const removeAllData = () => {
  removeLoginData();
  removeUserData()
}
export const getAllData = () => {
  return { ...getLoginData(), ...getUserData() } || {}
}
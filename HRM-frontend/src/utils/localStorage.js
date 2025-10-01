/**
 * 本地存储
 * accessToken
 * refreshToken
 * username
 * rememberMe
 * autologinExpire
*/

//设置、删除、获取自动登录数据
export const setAutoLoginData = (rememberMe, autoLoginExpire, username) => {
  if (rememberMe) localStorage.setItem("rememberMe", rememberMe)
  if (autoLoginExpire) {
    localStorage.setItem("autoLoginExpire", autoLoginExpire)
  } else {
    const expireTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem("autoLoginExpire", expireTime.toString())
  }
  if (username) localStorage.setItem("username", username)
}
export const removeAutoLoginData = () => {
  localStorage.removeItem("rememberMe")
  localStorage.removeItem('autoLoginExpire');
  localStorage.removeItem('username');
}
export const getAutoLoginData = () => {
  return [localStorage.getItem("rememberMe"), parseInt(localStorage.getItem("autoLoginExpire")), localStorage.getItem("username")]
}
//设置、删除、获取登录数据
export const setLoginData = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem("accessToken", accessToken)
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken)
}
export const removeLoginData = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
}
export const getLoginData = () => {
  return [localStorage.getItem("accessToken"), localStorage.getItem("refreshToken")]
}
//登出删除所有数据
export const removeAllData = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("rememberMe")
  localStorage.removeItem('autoLoginExpire');
  localStorage.removeItem('username');
}
import { loginFailure, loginSuccess, logout } from "../../store/slices/authSlice"
import { setLoginData } from "../../utils/localStorage"

const onSuccess = (data, dispatch, navigate) => {
  const { id, username, role, accessToken, refreshToken } = data
  setLoginData(accessToken, refreshToken)
  dispatch(loginSuccess({ username, id, role }))
  navigate('/dashboard')
}
const onError = (error, dispatch) => {
  dispatch(loginFailure())
}
const onAutoSuccess = (data, dispatch, navigate) => {
  const { id, username, role } = data
  dispatch(loginSuccess({ username, id, role }))
  navigate('/dashboard')
}
const onAutoError = (error, dispatch, navigate) => {
  dispatch(logout())
  navigate('/login')
}
export default {
  login: {
    success: {
      showMessage: true,
      message: "登录成功",
      handler: onSuccess
    },
    error: {
      showMessage: false,
      message: "登录失败！",
      handler: onError
    }
  },
  auto: {
    success: {
      showMessage: true,
      message: "自动登录成功",
      handler: onAutoSuccess
    },
    error: {
      showMessage: false,
      message: "自动登录失败！",
      handler: onAutoError
    }
  },
  captcha: {
    success: {
      showMessage: true,
      message: '验证码已发送至您的手机，请注意查收（5分钟内有效）'
    },
    error: {
      showMessage: false,
    }
  }
}

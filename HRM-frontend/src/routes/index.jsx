import { useRoutes, Navigate, useNavigate } from "react-router-dom"
import Login from "../pages/Login"
import { Button, Result } from "antd"
import Main from "../pages/Main/index.jsx"
import Dashboard from "../pages/Dashboard/inex.jsx"
import { useSelector } from "react-redux"
import { useEffect } from "react"
import { useNotification } from "../hooks/common/useMessage.jsx"

//路由守卫组件
function Protect({ children }) {
  //检查token是否有效
  const notification = useNotification()
  const { isAuthenticated } = useSelector(state => state.auth)
  const navigate = useNavigate()
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      notification.info({ message: "请先登录!" })
    }
    return children
  }, [isAuthenticated])

}

//路由配置
function Element() {
  return useRoutes([
    {
      path: "/login",
      element: <Login />
    }, {
      path: "/",
      element: <Navigate to="/login" />
    }
    , {
      element: <Protect><Main /></Protect>,
      children: [{
        path: '/dashboard',
        element: <Dashboard />
      }]
    }, {
      path: "*",
      element: <Result
        status="404"
        title="404"
        subTitle="404 Not Found! 抱歉，网页出现错误"
        extra={<Button type="primary">回到首页</Button>}
      />
    }
  ])
}


export default Element
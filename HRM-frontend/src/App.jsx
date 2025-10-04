import { useEffect } from 'react'
import Element from './routes'
import reactLogo from './assets/react.svg'

import viteLogo from '/vite.svg'
import './App.css'
import { getUserData, removeAllData } from './utils/localStorage'
import { useAutoLogin } from './hooks/api/auth'

function App() {
  const { mutate } = useAutoLogin()
  useEffect(() => {
    const { rememberMe, autoLoginExpire } = getUserData()
    if (rememberMe === true && autoLoginExpire) {
      //检查是否过有效期
      if (Date.now() < autoLoginExpire) {
        mutate()
      } else {
        removeAllData()
      }
    }
  })

  return (
    <Element />
  )
}

export default App

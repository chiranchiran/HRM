
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './api/queryClient.js'
import { MessageProvider } from './hooks/common/useMessage.jsx'
import { handleGlobalError } from './utils/error/errorHandler.js'
import './pages/message.css'
//全局错误处理
handleGlobalError()
createRoot(document.getElementById('root')).render(
  <MessageProvider>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </MessageProvider>
)

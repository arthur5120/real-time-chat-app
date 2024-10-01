import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../organisms/app'
import ChatRooms from '../organisms/chat-rooms'
import Login from '../organisms/login'
import CreateAccount from '../organisms/create-account'
import Profile from '../organisms/profile'
import AuthProvider from '../../utils/contexts/auth-provider'
import SocketProvider from '../../utils/contexts/socket-provider'
import ToastProvider from '../../utils/contexts/toast-provider'
import HealthProvider from '../../utils/contexts/health-provider'
import Error from '../atoms/error'
import '../../styles/global.css'

import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'

const Element = <>
  <AuthProvider>
    <SocketProvider>
      <ToastProvider>
        <HealthProvider>
          <App/>
        </HealthProvider>
      </ToastProvider>
    </SocketProvider>
  </AuthProvider>
</>

const Router = createBrowserRouter([{
  path : '/', element : Element,  errorElement : <Error />, children : [
    {path : '/chat-rooms', element : <ChatRooms/>, errorElement : <Error />},
    {path : '/login', element : <Login/>,  errorElement : <Error />},
    {path : '/create-account', element : <CreateAccount/>,  errorElement : <Error />},    
    {path : '/profile', element : <Profile/>,  errorElement : <Error />},
  ]
}])

ReactDOM.createRoot(document.getElementById('root')!).render(  
  <React.StrictMode>
      <RouterProvider router={Router} />     
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../organisms/app'
import Profile from '../organisms/profile'
import Login from '../organisms/login'
import CreateAccount from '../organisms/create-account'
import '../../styles/global.css'
import AuthProvider from '../../utils/auth-provider'

import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'

const Router = createBrowserRouter([{
  path : '/', element : <AuthProvider><App/></AuthProvider>,  errorElement : <h3>Oopsie</h3>, children : [
    {path : '/profile', element : <Profile/>, errorElement : <h3>Oopsie</h3>},
    {path : '/login', element : <Login/>,  errorElement : <h3>Oopsie</h3>},
    {path : '/create-account', element : <CreateAccount/>,  errorElement : <h3>Oopsie</h3>}
  ]
}])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <RouterProvider router={Router} />     
  </React.StrictMode>,
)

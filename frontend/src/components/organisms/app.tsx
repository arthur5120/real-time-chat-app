import Navbar from "../molecules/navbar"
import AuthBanner from "../molecules/auth-banner"
import { Outlet, useLocation } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { authContext } from "../../utils/contexts/auth-provider"
import { toastContext } from "../../utils/contexts/toast-provider"
import { socketContext } from "../../utils/contexts/socket-provider"
import { TSocketAuthRequest, TRes } from "../../utils/types"
import { authStatus, getUserById, authLogout } from "../../hooks/useAxios"

const App = () => {

  const {auth, setAuth, setRole, getAuthTokenStatus} = useContext(authContext)
  const socket = useContext(socketContext)
  const {notifyUser} = useContext(toastContext)
  
  const [checkAuthStatus, setCheckAuthStatus] = useState(false)
  const [previousAuth, setPreviousAuth] = useState(auth)  
  const location = useLocation()  

  const handleSocketOnlineList = async () => {    

    const authInfo : TRes = await authStatus({})  
    
    //console.log(`localAuth : ${auth}, serverAuth : ${authInfo.authenticated}`)
    
      try {

        socket?.connect()
  
        if (auth && authInfo.id != `none`) {             
          const user = await getUserById(authInfo.id)
          setRole ? setRole(authInfo.role) : ''
          const authRequest : TSocketAuthRequest = {user : {name : user.name, id : authInfo.id}, isConnecting : true}                        
          socket?.emit(`auth`, authRequest)
          socket?.emit(`authList`)
          //notifyUser(`${authRequest.isConnecting ? `Connecting` : `Disconnecting`} ${authRequest.user.id}`)
          return
        }
    
        if (!auth && authInfo.id != `none`) {           
          const authRequest : TSocketAuthRequest = {user: {id : authInfo.id}, isConnecting : false}
          setRole ? setRole('none') : ''
          socket?.emit(`auth`, authRequest)
          socket?.emit(`authList`)
          await authLogout({}) // Logout if auth is false.
          //notifyUser(`${authRequest.isConnecting ? `Connecting` : `Disconnecting`} ${authRequest.user.id}`)
          return
        }         

      } catch (e) {
        notifyUser(e)
      }      
    
  }

  const handleSessionExpiration = async () => {            
    const authenticated = getAuthTokenStatus ? await getAuthTokenStatus() : ''    
    if (!authenticated) {                           
      setAuth ? setAuth(false) : ''
      auth ? notifyUser(`Logged out`) : ''      
    } else if (!auth) {          
      setAuth ? setAuth(true) : ''      
    }    
  }
  
  const timer = setInterval(() => {
    setCheckAuthStatus(!checkAuthStatus)
  }, 15000)

  useEffect(() => { 

    const delay = setTimeout(() => { // avoids flicking on UI      
      handleSessionExpiration()      
    }, 200)

    return () => {  
      clearTimeout(delay)
      clearInterval(timer)
    }

  }, [location, checkAuthStatus])
  
  useEffect(() => {

    if (auth != previousAuth) {            
      handleSocketOnlineList()
      setPreviousAuth(auth)
    }

    return () => {
      if (auth != previousAuth) {
        socket?.off('auth')
        socket?.disconnect()
      }
    }

  }, [location, auth])

  return (

    <>     

      <img   
        loading='eager'    
        src='./src/assets/images/background3.png' 
        className='min-h-screen min-w-screen w-screen h-screen max-h-screen max-w-screen opacity-5 aspect-auto object-cover'
        alt='background image'
      />

      <section className='flex flex-col absolute inset-0 min-h-screen min-w-screen w-full h-full'>

        <header>

        <AuthBanner/>
        
        <Navbar />

        </header>

        <main>
          <Outlet/>
        </main>
        
        <footer className='flex items-center justify-center mt-auto my-4'>
          <h3>
            MIT License - Copyright (c) 2024 Arthur Silva dos Santos
          </h3>
        </footer>

      </section>

    </>

  )

}

export default App
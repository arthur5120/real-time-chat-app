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

  const {auth, setAuth, checkToken} = useContext(authContext)
  const socket = useContext(socketContext)
  const {notifyUser} = useContext(toastContext)
  
  const [checkAuthStatus, setCheckAuthStatus] = useState(false)
  const [previousAuth, setPreviousAuth] = useState(auth)      
  const [noUpdate, SetNoUpdate] = useState(false)
  const location = useLocation()    

  const timer = setInterval(() => {
    auth ? setCheckAuthStatus(!checkAuthStatus) : ''
  }, 15000)

  const handleSocketOnlineList = async () => {    

    const authInfo : TRes = await authStatus({})  
    
    console.log(`localAuth : ${auth}, serverAuth : ${authInfo.authenticated}`)
    
      try {

        socket?.connect()
  
        if (auth && authInfo.id != `none`) {             
          const user = await getUserById(authInfo.id)
          const authRequest : TSocketAuthRequest = {user : {name : user.name, id : authInfo.id}, isConnecting : true}                        
          socket?.emit(`auth`, authRequest)
          //notifyUser(`${authRequest.isConnecting ? `Connecting` : `Disconnecting`} ${authRequest.user.id}`)
          return
        }
    
        if (!auth && authInfo.id != `none`) {           
          const authRequest : TSocketAuthRequest = {user: {id : authInfo.id}, isConnecting : false}                                
          socket?.emit(`auth`, authRequest)
          await authLogout({}) // Logout if auth is false.
          //notifyUser(`${authRequest.isConnecting ? `Connecting` : `Disconnecting`} ${authRequest.user.id}`)
          return
        } 

        //socket?.disconnect()
        socket?.off('auth')

      } catch (e) {
        notifyUser(e)
      }      
    
  }

  const handleSessionExpiration = async () => {            
    const authenticated = checkToken ? await checkToken() : ''    
    if (!authenticated) {                           
      setAuth ? setAuth(false) : '' // Only updates on next render
      auth ? notifyUser(`Logged out`) : ''
      SetNoUpdate(true)         
    } else if (!auth) {          
      setAuth ? setAuth(true) : '' // Makes the function run a second time unnecessarily
      SetNoUpdate(true)
    }    
  } 
  
  useEffect(() => {
    
    const delay = setTimeout(() => { // avoids flicking on auth change
      SetNoUpdate(false)
      if (!noUpdate && auth != previousAuth) {
        handleSessionExpiration()
      }
    }, 1000)

    if (auth != previousAuth) {            
      handleSocketOnlineList()
      setPreviousAuth(auth)
    }

    return () => {  
      clearTimeout(delay)
      clearInterval(timer)
    }
     
  }, [location, auth, checkAuthStatus])

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
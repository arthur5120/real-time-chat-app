import Navbar from "../molecules/navbar"
import AuthBanner from "../molecules/auth-banner"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { authContext } from "../../utils/contexts/auth-provider"
import { toastContext } from "../../utils/contexts/toast-provider"
import { socketContext } from "../../utils/contexts/socket-provider"
import { healthContext } from "../../utils/contexts/health-provider"
import { TSocketAuthRequest, TRes } from "../../utils/types"
import { authStatus, getUserById, authLogout } from "../../utils/axios-functions"
import { getCSRFToken, setAxiosCSRFToken } from "../../utils/axios-functions"
import { getCSRFCookie, obscureString, revealString, verifyCSRFToken } from "../../utils/useful-functions"
import Cookies from 'js-cookie'

const App = () => {

  const socket = useContext(socketContext)
  const {notifyUser} = useContext(toastContext)
  const {auth, setAuth, setRole, getAuthTokenStatus, clickedToLogout, setClickedToLogout} = useContext(authContext)
  const {updateServerStatus} = useContext(healthContext)
  const {serverStatus} = useContext(healthContext)
  const [previousAuth, setPreviousAuth] = useState(auth)
  const [hasSessionExpired, setHasSessionExpired] = useState(false)
  const [requireRefresh, setRequireRefresh] = useState(true)
  const [firstLoad, setFirstLoad] = useState(true)
  const location = useLocation()
  const navigate = useNavigate() 

  const requestSocketListUpdate = async () => { 
    const authInfo : TRes = await authStatus({})
    if(authInfo.id != `none`) {      
      socket?.connect()
      const user = await getUserById(authInfo.id)
      socket?.emit(`updateInactive`, { id : authInfo.id, name: user.name, inactive: false})
    }
  }

  const retrieveCSRFToken = async () => {    

    Cookies.remove(`_csrf`)
    Cookies.remove(`_csrf_manual`)

    const res = await getCSRFToken()

      if(res?.CSRFToken) {        
        setAxiosCSRFToken(res.CSRFToken)
        const obString = await obscureString(res.CSRFToken)
          Cookies.set(`_csrf_manual`, obString, {
            httpOnly: false,
            secure: false,
            sameSite: 'strict'
          })
      }    
  }

  const retrieveCSRFTokenIfInvalid = async () => {
    try {

      const CSRFCookie = getCSRFCookie(`_csrf_manual`)

      if(CSRFCookie) {

        const reString = await revealString(CSRFCookie)
        const isTokenValid = await verifyCSRFToken(reString)
                
        if(isTokenValid) {          
          setAxiosCSRFToken(reString)
        } else {          
          console.log(`retrieving new token : Token Invalid.`)
          retrieveCSRFToken()
        }
        
      } else {
        console.log(`retrieving new token : No Cookie Found.`)
        retrieveCSRFToken()
      }

    } catch (e) {       
      notifyUser(`Something Went Wrong`, `warning`)
    }
  }

  const handleSocketOnlineList = async () => {

    const authInfo : TRes = await authStatus({})
    
      try {

        socket?.connect()
        setClickedToLogout ? setClickedToLogout(false) : ''
        
        if(hasSessionExpired) { // Session Expired or the token was not found.
          //notifyUser(`Session Expired.`)
          setRole ? setRole(authInfo.role) : ''
          const authRequest : TSocketAuthRequest = {user : {id : ``}, isConnecting : false}
          socket?.emit(`auth`, authRequest)
          socket?.emit(`authList`)
          socket?.emit(`inactiveList`)
          setHasSessionExpired(false)
        }
  
        if (auth && authInfo.id != `none` && !clickedToLogout) { // Login
          //notifyUser(`Login.`)
          const user = await getUserById(authInfo.id)
          setRole ? setRole(authInfo.role) : ''
          const authRequest : TSocketAuthRequest = {user : {id : authInfo.id, name : user.name}, isConnecting : true}
          socket?.emit(`auth`, authRequest)
          socket?.emit(`authList`)
          socket?.emit(`inactiveList`)
          // notifyUser(`${authRequest.isConnecting ? `Connecting` : `Disconnecting`} ${authRequest.user.id}`)
          return
        }
    
        if (!auth && authInfo.id != `none`) { // Logout
          setRole ? setRole('none') : ''
          const authRequest : TSocketAuthRequest = {user: {id : authInfo.id}, isConnecting : false}
          socket?.emit(`auth`, authRequest)
          socket?.emit(`authList`)
          socket?.emit(`inactiveList`)
          await authLogout({})
          // notifyUser(`${authRequest.isConnecting ? `Connecting` : `Disconnecting`} ${authRequest.user.id}`)
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
      if (auth) {
        notifyUser(`Logged out`)
        setHasSessionExpired(true)
        navigate('/login')
      }      
    } else if (!auth && !clickedToLogout) {
      setAuth ? setAuth(true) : ''
    }
  }
  
  useEffect(() => {

    let delay : NodeJS.Timeout | null = null

    const timer = setInterval(async () => {
      const currentServerStatus = updateServerStatus ? await updateServerStatus() : ``      
      if(!currentServerStatus) {
        return
      }
      if (delay) {
        clearTimeout(delay)
      }  
      delay = setTimeout(() => { // avoids flicking on the UI        
        handleSessionExpiration()
      }, 200)                  

      retrieveCSRFTokenIfInvalid()

    }, 15000)
    
    return () => {   
      if (delay) {
        clearTimeout(delay)
      }
      clearInterval(timer)
    }

  }, [location])
  
  useEffect(() => {     
    if (auth != previousAuth) {
      handleSocketOnlineList()
      setPreviousAuth(auth)
    }
  }, [location, auth])

  useEffect(() => {      
    const timeout = setTimeout(() => {
      requestSocketListUpdate()      
    }, 1000)
    return () => {
      clearTimeout(timeout)
    }
  }, [socket])

  useEffect(() => {   

    if(!serverStatus) {
      if(!firstLoad) {
        notifyUser(`Lost connection to the server.`)
        setRequireRefresh(true)
      }
      return
    }   
    if(requireRefresh && !firstLoad) {
      console.log(`Server Restarted`)      
      window.location.reload()
    }
    const delay = setTimeout(() => { // avoids flicking on the UI      
      handleSessionExpiration()
    }, 200) 
    
    retrieveCSRFTokenIfInvalid()

    return () => {
     clearTimeout(delay) 
    }    
  }, [serverStatus])

  useEffect(() => {    
    const delay = setTimeout(() => {      
      setFirstLoad(false)
    }, 500)
    return () => {
      clearTimeout(delay)
    }
  }, [])

  return (

    <>     

      <img   
        loading='eager'    
        src='./src/assets/images/background3.png' 
        className='min-h-screen min-w-screen w-screen h-screen max-h-screen max-w-screen opacity-5 aspect-auto object-cover'
        alt='background image'
      />

      <section 
        className='flex flex-col absolute inset-0 min-h-screen min-w-screen w-full h-full'        
      >

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
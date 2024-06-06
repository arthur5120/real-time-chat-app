import Navbar from "../molecules/navbar"
import AuthBanner from "../molecules/auth-banner"
import { Outlet, useLocation } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { authContext } from "../../utils/contexts/auth-provider"
import { toastContext } from "../../utils/contexts/toast-provider"

const App = () => {

  const {auth, checkToken} = useContext(authContext)
  const {notifyUser} = useContext(toastContext)
  const [checkAuthStatus, setCheckAuthStatus] = useState(false)
  const location = useLocation()  

  const timer = setInterval(() => {
    auth ? setCheckAuthStatus(!checkAuthStatus) : ''
  }, 30000)

  const handleSessionExpiration = async () => {
    console.log(`Checking for Authentication Status...`)      
    const result = checkToken ? await checkToken() : ''
    if(auth) {
      !result ? notifyUser(`Logged out`) : ''
      console.log(`Authentication Status Result : ${result}`)
    }
  }
  
  useEffect(() => {     
   
    handleSessionExpiration()

    return () => {
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
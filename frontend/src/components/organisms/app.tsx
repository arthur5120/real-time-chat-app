import Navbar from "../molecules/navbar"
import { Outlet, useLocation } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { authContext } from "../../utils/contexts/auth-provider"
import { toastContext } from "../../utils/contexts/toast-provider"
import CustomTitle from "../atoms/title"

const App = () => {

  const {auth, role, checkToken} = useContext(authContext)  
  const {notifyUser} = useContext(toastContext)
  const [checkAuthStatus, setCheckAuthStatus] = useState(false)
  const location = useLocation()  
  
  const authColor = auth ? 'bg-emerald-600' : 'bg-red-600'
  const authText = auth ? `Authenticated with ${role == 'Admin' ? 'Administrator' : role} Privileges` : 'Not Authenticated'  

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

      <header>

        <section className={`flex items-center justify-center ${authColor} p-5 my-4`}>
          <CustomTitle value={authText} className='bg-transparent text-white'/>
        </section>

        <Navbar />

      </header>

      <main>
        <Outlet/> 
      </main> 

      <footer className='flex items-center justify-center mt-auto my-3'>        
        <h3>MIT License - Copyright (c) 2024 Arthur Silva dos Santos</h3>
      </footer>

    </>

  )

}

export default App
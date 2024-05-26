import Navbar from "../molecules/navbar"
import { Outlet, useLocation } from "react-router-dom"
import { useContext, useEffect } from "react"
import { authContext } from "../../utils/contexts/auth-provider"
import CustomTitle from "../atoms/title"

const App = () => {

  const {auth, role, checkToken} = useContext(authContext)  
  const location = useLocation()

  const authColor = auth ? 'bg-emerald-600' : 'bg-red-600'
  const authText = auth ? `Authenticated with ${role == 'Admin' ? 'Administrator' : role} Privileges` : 'Not Authenticated'  

  useEffect(() => {   
    if(checkToken){
      checkToken()      
    }
  }, [location, auth])

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
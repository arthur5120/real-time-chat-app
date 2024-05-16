import Navbar from "../molecules/navbar"
import { Outlet } from "react-router-dom"
import { useContext } from "react"
import { authContext } from "../../utils/contexts/auth-provider"
import CustomTitle from "../atoms/title"

const App = () => {

  const {auth, role} = useContext(authContext)    

  const authStatus = auth ? { value : `Authenticated as ${role}`, className : 'bg-green-600 text-white rounded-xl m-2 p-2'} : 
  {value : 'Not Authenticated', className : 'bg-red-500 text-white rounded-xl m-2 p-2'}

  return (

    <>

      <header>

        <section className={`flex items-center justify-center ${auth ? 'bg-emerald-600' : 'bg-red-600'} p-5 my-3`}>
          <CustomTitle {...authStatus} className='bg-transparent text-white'/>      
        </section>

        <Navbar />

      </header>

      <main>
        <Outlet/> 
      </main> 

      <footer className='absolute bottom-3.5 w-full'>
        <h3 className='flex item-center justify-center'>MIT License - Copyright (c) 2024 Arthur Silva dos Santos</h3>
      </footer>

    </>

  )

}

export default App
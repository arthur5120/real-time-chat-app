import Navbar from "../molecules/navbar"
import { Outlet } from "react-router-dom"
import { useContext } from "react"
import { authContext } from "../../utils/contexts/auth-provider"
import CustomTitle from "../atoms/title"

const App = () => {

  const {auth, role} = useContext(authContext)

  const authStatus = auth ? 
  {value : `Authenticated as ${role}`, className : 'bg-green-500 text-white rounded-xl m-2 p-2'} : 
  {value : 'Not Authenticated', className : 'bg-red-500 text-white rounded-xl m-2 p-2'}

  return (

    <>

      <div className={`flex items-center justify-center ${auth ? 'bg-emerald-500' : 'bg-red-500'} p-5 my-8`}>
        <CustomTitle {...authStatus} className='bg-transparent text-white'/>
      </div>

      <Navbar />
      <Outlet/>

    </>

  )

}

export default App
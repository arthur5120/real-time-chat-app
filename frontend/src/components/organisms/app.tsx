import Navbar from "../molecules/navbar"
import { Outlet } from "react-router-dom"
import { useContext } from "react"
import { authContext } from "../../utils/auth-provider"
import CustomTitle from "../atoms/title"

const App = () => {

  const {auth} = useContext(authContext)

  const authStatus = auth ? 
  {value : 'authenticated', className : 'bg-green-500 text-white rounded-xl m-2 p-2'} : 
  {value : 'not authenticated', className : 'bg-red-500 text-white rounded-xl m-2 p-2'} 

  return (

    <>     

      <CustomTitle {...authStatus}/>

      <Navbar />
      <Outlet/>

    </>

  )

}

export default App
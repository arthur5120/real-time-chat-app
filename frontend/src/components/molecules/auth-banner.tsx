import { useContext } from "react"
import { authContext } from "../../utils/contexts/auth-provider"
import CustomTitle from "../atoms/title"

const AuthBanner = () => {

    const { auth, role } = useContext(authContext)
  
    return (

      auth ? <section className={`flex items-center justify-center bg-emerald-600 p-5 my-4`}>
        <CustomTitle value={`Authenticated with ${role == 'Admin' ? 'Administrator' : role} Privileges`} className='bg-transparent text-white'/>
      </section> : <section className={`flex items-center justify-center bg-red-600 p-5 my-4`}>
        <CustomTitle value={`Not Authenticated`} className='bg-transparent text-white'/>
      </section>

    )

  }
  
  export default AuthBanner

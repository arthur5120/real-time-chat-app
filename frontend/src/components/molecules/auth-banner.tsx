import { useContext, useEffect, useState } from "react"
import { authContext } from "../../utils/contexts/auth-provider"
import CustomTitle from "../atoms/title"

const AuthBanner = () => {

    const { auth, role } = useContext(authContext)
    const [authColor, setAuthColor] = useState('')
    const [authText, setAuthText] = useState('')
  
    useEffect(() => {

      const intervalId = setInterval(() => {

        if (auth) {
            setAuthText(`Authenticated with ${role == 'Admin' ? 'Administrator' : role} Privileges`)
            setAuthColor('bg-emerald-600')
        } else {
            setAuthText('Not Authenticated')
            setAuthColor('bg-red-600')
        }

      }, 50)
  
      return () => {
        clearInterval(intervalId)
      }

    }, [auth, role])
  
    return (

      <section className={`flex items-center justify-center ${authColor} p-5 my-4`}>
        <CustomTitle value={authText} className='bg-transparent text-white'/>
      </section>

    )

  }
  
  export default AuthBanner

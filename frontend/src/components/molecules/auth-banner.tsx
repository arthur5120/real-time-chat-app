import { useContext, useEffect, useRef, useState } from "react"
import { authContext } from "../../utils/contexts/auth-provider"
import { useLocation } from "react-router-dom"
import CustomTitle from "../atoms/title"

const AuthBanner = () => {

    const { auth, role } = useContext(authContext)
    const [authColor, setAuthColor] = useState('')
    const [authText, setAuthText] = useState('')
    const authRef = useRef(auth)
    const location = useLocation()
  
    useEffect(() => {

      console.log(`changing banner to ${authRef.current ? `auth` : `not-auth`}`)

      const timeoutId = setTimeout(() => {
        
        if (authRef.current) {
          setAuthText(`Authenticated with ${role == 'Admin' ? 'Administrator' : role} Privileges`)
          setAuthColor('bg-emerald-600')
        } else {
          setAuthText('Not Authenticated')
          setAuthColor('bg-red-600')
        }
        
        authRef.current = auth

        return () => {
          clearTimeout(timeoutId)
        }

      }, 50)

    }, [auth, role, location])
  
    return (

      <section className={`flex items-center justify-center ${authColor} p-5 my-4`}>
        <CustomTitle value={authText} className='bg-transparent text-white'/>
      </section>

    )

  }
  
  export default AuthBanner

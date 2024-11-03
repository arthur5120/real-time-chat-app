import CustomTitle from "../atoms/title"
import CustomForm from "../molecules/form"
import CustomButton from "../atoms/button"
import { FormEvent, useContext, useEffect, useState } from "react"
import { TUser, TFieldKeys } from "../../utils/types"
import { userPlaceholder, errorMessagePlaceholder } from "../../utils/placeholders"
import { authLogin, authStatus } from "../../utils/axios-functions"
import { authContext } from "../../utils/contexts/auth-provider"
import { useNavigate } from "react-router-dom"
import { primaryDefault, secondaryDefault } from "../../utils/tailwindVariations"

const fieldList : TFieldKeys[] = [
  'email',
  'password',
]

const mockUserData = {
  ...userPlaceholder, 
  email : 'mockuser@hotmail.com', 
  password : 'Password@123'
}

const Login = () => {  

  const {auth, setAuth, setClickedToLogin, logout} = useContext(authContext)
  const [data, setData] = useState<TUser>(mockUserData)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)  

  const navigate = useNavigate() 
  
  const onSubmit = async (e : FormEvent<HTMLFormElement>) => {       
    
    e.preventDefault()  
    setLoading(true)

    if (setAuth && setClickedToLogin) {      
      try {
        
        const hasToken = await authStatus({})

        if(hasToken && logout) {
          logout()
        }
        
        const serverResponse = await authLogin(data)
        
        if(serverResponse.success) {
          setMessage(`Authenticated`)
          setClickedToLogin(true)
          setAuth(true)
        } else {          
          setMessage(serverResponse?.message ? serverResponse.message : errorMessagePlaceholder)
        }
      } catch (e) {        
        setMessage(e instanceof Error && e.message ? e.message : errorMessagePlaceholder)
      }      
    }

    setLoading(false)
    
  }

  const onSignup = () => {
    navigate('/create-account')
  }

  useEffect(() => {
    if (auth) {
      navigate('/chat-rooms')
    } else {
      navigate('/login')
    }
  }, [auth])

  return (

    <>

        <CustomTitle value='Login Page' className='text-yellow-500 my-3'/>

        <CustomForm
          data={data}
          setData={setData}
          onSubmit={onSubmit}
          fields={fieldList} 
          formClassName={primaryDefault} 
          inputClassName={secondaryDefault}
        >

          <div className='flex flex-row justify-center items-center bg-transparent my-3'>            
            <CustomButton value='Sign Up' type="reset" className='p-5 my-5' variationName="vartwo" onClick={() => onSignup()}/>
            <CustomButton value='Sign In' className='p-5 my-5' variationName="varthree"/>
          </div>

        </CustomForm>

        <CustomTitle value={message} variationName="varthree"/>
          
        {loading ? <CustomTitle value={'please wait...'} variationName="varthree"/> : ''}

    </>

  )

}

export default Login

import CustomTitle from "../atoms/title"
import CustomForm from "../molecules/form"
import CustomButton from "../atoms/button"
import { FormEvent, useContext, useState } from "react"
import { TUser, TFieldKeys } from "../../utils/types"
import { userPlaceholder } from "../../utils/placeholders"
import { authLogin } from "../../hooks/useAxios"
import { authContext } from "../../utils/contexts/auth-provider"
import { useNavigate } from "react-router-dom"
import { primaryDefault, secondaryDefault } from "../../utils/tailwindVariations"

const Login = () => {  

  const [data, setData] = useState<TUser>({...userPlaceholder, email : 'mockuser@hotmail.com', password : 'Password@123'})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const fieldList : TFieldKeys[] = [
    'email',
    'password',
  ]

  const {setAuth} = useContext(authContext)  
  
  const onSubmit = async (e : FormEvent<HTMLFormElement>) => { 
    e.preventDefault()  
    setLoading(true)

    if (setAuth != null) {
      try {
        const serverResponse = await authLogin(data)
        setMessage(`${serverResponse.success ? 'Authenticated' : 'Invalid Credentials'}`)        
        setAuth(true)        
        navigate('/profile')
        setLoading(false)
      } catch (e) {
        setMessage(`Invalid Credentials`)
        setLoading(false)
      }
    }
    
  }

  const onSignup = () => {
    navigate('/create-account')
  }

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

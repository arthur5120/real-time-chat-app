import CustomTitle from "../atoms/title"
import Form from "../molecules/form"
import { FormEvent, useContext, useState } from "react"
import { TUser, TFieldKeys } from "../../utils/types"
import { userPlaceholder } from "../../utils/placeholders"
import { authUser } from "../../hooks/useAxios"
import { authContext } from "../../utils/auth-provider"

const Login = () => {

  const [data, setData] = useState<TUser>({...userPlaceholder, email : 'mockuser@hotmail.com', password : 'Password@123'})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
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
        const serverResponse = await authUser(data)        
        setMessage(`Authenticated as ${JSON.stringify(serverResponse)}`)
        setAuth(true)        
      } catch (e) {
        setMessage('Invalid Credentials')
      }
    }

    setLoading(false)
  }

  return (

    <>

        <CustomTitle value='Login Page'/>

        <Form
          data={data}
          setData={setData}
          onSubmit={onSubmit}
          fields={fieldList}
        />

        <CustomTitle value={message} variationName="varthree"/>
          
        {loading ? <CustomTitle value={'please wait...'} variationName="varthree"/> : ''}
      
    </>

  )

}

export default Login

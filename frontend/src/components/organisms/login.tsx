import CustomTitle from "../atoms/title"
import Form from "../molecules/form"
import { FormEvent, useState } from "react"
import { TUser, TFieldKeys } from "../../utils/types"
import { userPlaceholder } from "../../utils/placeholders"
import { validateUser } from "../../utils/validation-functions"

const Login = () => {

  const [data, setData] = useState<TUser>(userPlaceholder)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)   
  
  const fieldList : TFieldKeys[] = [
    'email', 
    'password',
  ]
  
  const onSubmit = (e : FormEvent<HTMLFormElement>) => {    
    setLoading(true)
    e.preventDefault()
    const res = validateUser(data)
    setMessage(JSON.stringify(res))
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

        <CustomTitle value={message}/>

        {loading ? <CustomTitle value={'please wait...'}/> : ''}
      
    </>

  )

}

export default Login

import CustomTitle from "../atoms/title"
import Form from "../molecules/form"
import { FormEvent, useState } from "react"
import { TUser, TFieldKeys } from "../../utils/types"
import { userPlaceholder } from "../../utils/placeholders"

const Login = () => {

  const [data, setData] = useState<TUser>(userPlaceholder)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
  const fieldList : TFieldKeys[] = [
    'email', 
    'password',
  ]
  
  const onSubmit = (e : FormEvent<HTMLFormElement>) => { 
    alert(JSON.stringify(data))   
    setLoading(true)
    e.preventDefault()
    const res = `Congrats you're logged in!` // Dummy Auth Response
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

        <CustomTitle value={message} variationName="varthree"/>
          
        {loading ? <CustomTitle value={'please wait...'} variationName="varthree"/> : ''}
      
    </>

  )

}

export default Login

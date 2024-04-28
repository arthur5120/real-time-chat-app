import Form from "../molecules/form"
import CustomTitle from "../atoms/title"
import { FormEvent, useEffect, useState } from "react"
import { TUser, TFieldKeys } from "../../utils/types"
import { userPlaceholder } from "../../utils/placeholders"
import { getUsers } from "../../hooks/useAxios"
import { validateUser } from "../../utils/validation-functions"

const CreateAccount = () => {

  const [data, setData] = useState<TUser>(userPlaceholder)
  const [dataCollection, setDataCollection] = useState<TUser[]>([userPlaceholder])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
  const fieldList : TFieldKeys[] = [
    'name', 
    'email', 
    'username', 
    'password',
  ]

  const fetchUsers = async () => {
    setLoading(true)
    const users = await getUsers()
    setDataCollection(users)
    setLoading(false)
  }  
  
  const onSubmit = (e : FormEvent<HTMLFormElement>) => {    
    setLoading(true)
    e.preventDefault()
    const res = validateUser(data)
    setMessage(JSON.stringify(res))
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [dataCollection.length])

  return (

    <>

        <CustomTitle value='Create Account Page' className="text-green-500"/>

        <Form 
          data={data} 
          setData={setData} 
          dataCollection={dataCollection} 
          onSubmit={onSubmit}   
          fields={fieldList}       
        />

          <CustomTitle value={message} variationName="varthree"/>
          
          {loading ? <CustomTitle value={'please wait...'} variationName="varthree"/> : ''}      

    </>

  )

}


export default CreateAccount

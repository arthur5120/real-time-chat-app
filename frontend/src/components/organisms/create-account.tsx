import Form from "../molecules/form"
import CustomTitle from "../atoms/title"
import { FormEvent, useEffect, useState } from "react"
import { TUser, TFieldKeys } from "../../utils/types"
import { userPlaceholder } from "../../utils/placeholders"
import { createUser, getUsers } from "../../hooks/useAxios"
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
  
  const onSubmit = async (e : FormEvent<HTMLFormElement>) => {  

    e.preventDefault()
    setLoading(true)        

    alert(`Trying to create ${JSON.stringify(data)}`)

      const validationResult = validateUser(data)
    
      if (validationResult.success) {

        try {
          const serverResponse = await createUser(data)
          setMessage(serverResponse.message)
        } catch (e) {
          setMessage('Failed to create user. Please try again.')
        }

      } else {
        setMessage(validationResult.message)
      }
    
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
          onSubmit={onSubmit}
          role={true}
          fields={fieldList}
        />

        <div className='flex flex-col justify-center items-center'>
          
        </div>

          <CustomTitle value={message} variationName="varthree"/>
          
          {loading ? <CustomTitle value={'please wait...'} variationName="varthree"/> : ''}      

    </>

  )

}


export default CreateAccount

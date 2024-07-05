import CustomForm from "../molecules/form"
import CustomTitle from "../atoms/title"
import CustomButton from "../atoms/button"
import { FormEvent, useEffect, useState } from "react"
import { TUser, TFieldKeys } from "../../utils/types"
import { userPlaceholder } from "../../utils/placeholders"
import { createUser, getUsers } from "../../hooks/useAxios"
import { validateUser } from "../../utils/validation-functions"
import { primaryDefault, secondaryDefault } from '../../utils/tailwindVariations'

const fieldList : TFieldKeys[] = [
  'name',
  'email',
  'username',
  'password',
]

const CreateAccount = () => {

  const [data, setData] = useState<TUser>(userPlaceholder)
  const [dataCollection, setDataCollection] = useState<TUser[]>([userPlaceholder])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    const users = await getUsers()
    setDataCollection(users)
    setLoading(false)
  }
  
  const onSubmit = async (e : FormEvent<HTMLFormElement>) => {

    e.preventDefault()

    setLoading(true)

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

  const onClear = () => {
    setData(userPlaceholder)    
  }

  useEffect(() => {
    fetchUsers()
  }, [dataCollection.length])

  return (

    <>

        <CustomTitle value='Create Account Page' className='text-green-500 my-3'/>

          <CustomForm data={data} setData={setData} onSubmit={onSubmit} role={true} fields={fieldList} formClassName={primaryDefault} inputClassName={secondaryDefault}>
              <div className='flex flex-row justify-center items-center bg-transparent my-3'>
                <CustomButton value='Clear' onClick={() => onClear()} type="reset" className='p-5 my-5' variationName="vartwo"/>
                <CustomButton value='Submit' className='p-5 my-5' variationName="varthree"/>
              </div>
          </CustomForm>

        <CustomTitle value={message} variationName="varthree"/>
        
        {loading ? <CustomTitle value={'please wait...'} variationName="varthree"/> : ''}         

    </>

  )

}


export default CreateAccount

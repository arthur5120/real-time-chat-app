import { FC, ChangeEvent, Dispatch, SetStateAction, ReactElement } from "react"
import { TUser, TFieldKeys } from "../../utils/types"
import CustomInput from "../atoms/input"
import CustomSelect from "../atoms/select"

type TFormProps = {
  data : TUser,
  setData : Dispatch<SetStateAction<object>>
  onSubmit : Function
  fields : TFieldKeys[]
  role ? : boolean
  dataCollection ? : Object[]
  children ? : ReactElement
}

const CustomForm : FC<TFormProps> = ({data, setData, onSubmit, fields, role=false, dataCollection=null, children}) => {
  
  const handleChange = (e : ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
    setData((values) => ({
      ...values,
      [e.target.name] : e.target.value
    }))
  }

  return (

    <form className="flex flex-col items-center justify-center" onSubmit={(e) => onSubmit(e)}>
        
        <fieldset className="flex flex-col items-center justify-center  bg-gray-700 rounded-lg p-5">

          {fields != null ? fields.map(
            (field, index) => 

              <CustomInput 
                key={`${field}${index}`}
                name={field} 
                type={field} 
                onChange={(e) => handleChange(e)}
                value={data[field]}
                className='bg-gray-500'
              />

          ) : ''}
          
          {role ? <>
            <CustomSelect name='role' values={[{name : 'User'}, {name : 'Admin'}]} onChange={(e) => handleChange(e)} className='bg-gray-500'/>
          </> : ''}
          
          {dataCollection != null ? <CustomSelect values={dataCollection} className='bg-blue-700'/> : ''}

        </fieldset>        

          {children ? children : ''}
      
    </form>

  )

}


export default CustomForm

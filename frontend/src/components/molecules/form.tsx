import { FC, ChangeEvent, Dispatch, SetStateAction, ReactElement } from "react"
import { TUser, TFieldKeys } from "../../utils/types"
import CustomInput from "../atoms/input"
import CustomSelect from "../atoms/select"
import { twMerge } from "tailwind-merge"

type TFormProps = {
  data : TUser,
  setData : Dispatch<SetStateAction<object>>
  onSubmit : Function
  fields : TFieldKeys[]
  role ? : boolean
  dataCollection ? : Object[]
  children ? : ReactElement,
  formClassName ? : string,
  inputClassName ? : string,
}

const formPlaceHolders = {
  role : '',
  name : 'Your first name here',
  username : 'Pick a username',
  email : 'Provide a valid email',
  password : 'Enter a strong password',
  created_at : ''
}

const CustomForm : FC<TFormProps> = ({
  data, setData, onSubmit, fields, role=false, dataCollection=null, children,
  formClassName, inputClassName  
}) => {

  const handleInputChange = (e : ChangeEvent<HTMLInputElement>) => { 
    setData((values) => ({
      ...values,
      [e.target.name] : e.target.value
    }))
  }
  
  const handleSelectChange = (e : ChangeEvent<HTMLSelectElement>) => { 

    const selectId = e.target.selectedIndex    
    const roomName = e.target[selectId].textContent

    setData((values) => ({
      ...values,
      [e.target.name] : roomName
    }))    
    
  }

  const mergedFormClassName = twMerge(`flex flex-col items-center justify-center bg-slate-700 rounded-lg p-5`, formClassName)

  return (

    <form className="flex flex-col items-center justify-center" onSubmit={(e) => onSubmit(e)}>
        
        <fieldset className={mergedFormClassName}>

          {fields != null ? fields.map(
            (field, index) => 

              <CustomInput 
                key={`${field}${index}`}
                name={field}
                autoComplete={`${field}`}
                type={field}
                onChange={(e) => handleInputChange(e)}
                placeholder={formPlaceHolders[field]}
                value={data[field]}
                className={inputClassName}
              />

          ) : ''}
          
          {role ? <>
            <CustomSelect id='role' name='role' values={[{name : 'User'}, {name : 'Admin'}]} onChange={(e) => handleSelectChange(e)} className={inputClassName}/>
          </> : ''}
          
          {dataCollection != null ? <CustomSelect values={dataCollection} className={inputClassName}/> : ''}

        </fieldset>        

          {children ? children : ''}
      
    </form>

  )

}


export default CustomForm

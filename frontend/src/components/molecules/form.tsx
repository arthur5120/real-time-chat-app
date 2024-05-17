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

const CustomForm : FC<TFormProps> = ({
  data, setData, onSubmit, fields, role=false, dataCollection=null, children,
  formClassName, inputClassName  
}) => {
  
  const handleChange = (e : ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
    setData((values) => ({
      ...values,
      [e.target.name] : e.target.value
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
                type={field} 
                onChange={(e) => handleChange(e)}
                value={data[field]}
                className={inputClassName}
              />

          ) : ''}
          
          {role ? <>
            <CustomSelect name='role' values={[{name : 'User'}, {name : 'Admin'}]} onChange={(e) => handleChange(e)} className={inputClassName}/>
          </> : ''}
          
          {dataCollection != null ? <CustomSelect values={dataCollection} className={inputClassName}/> : ''}

        </fieldset>        

          {children ? children : ''}
      
    </form>

  )

}


export default CustomForm

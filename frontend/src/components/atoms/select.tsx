import { twMerge } from "tailwind-merge";
import { inputVariations } from "../../utils/tailwindVariations";
import { capitilizeFirst } from "../../utils/useful-functions";

type SelectProps = Partial<{
    values : Partial<{name : string}>[],
    variationName : 'varone' | 'vartwo' | 'varthree'
} & React.SelectHTMLAttributes<HTMLSelectElement>>

const CustomSelect = ({name, values, className, variationName='varone', ...props} : SelectProps) => {  

  const mergedClasses = twMerge(inputVariations[variationName], className)  

  return (    

    <>    

    <label htmlFor={name} className="bg-transparent">{capitilizeFirst(`${name}`)}</label>
    
      <select name={name} {...props} className={mergedClasses}>{
        values? 
          values.map((value, index) => 

            <option key={`${value}${index}`}>
              {value.name ? value.name : '...'}
            </option>  

          ) 
        : ''
      }</select>
      
    </>

  )

}

export default CustomSelect

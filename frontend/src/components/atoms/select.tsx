import { twMerge } from "tailwind-merge";
import { inputVariations } from "../../utils/tailwindVariations";

type SelectProps = Partial<{
    values : Partial<{name : string}>[],
    variationName : 'varone' | 'vartwo' | 'varthree'
} & React.SelectHTMLAttributes<HTMLSelectElement>>

const CustomSelect = ({values, className, variationName='varone', ...props} : SelectProps) => {  

  const mergedClasses = twMerge(inputVariations[variationName], className)  

  return (    

    <>    
    
      <select {...props} className={mergedClasses}>{
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

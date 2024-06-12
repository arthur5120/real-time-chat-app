import { twMerge } from "tailwind-merge";
import { selectVariations } from "../../utils/tailwindVariations";
import { capitalizeFirst } from "../../utils/useful-functions";
import { forwardRef } from "react";

type SelectProps = Partial<{
    values : Partial<{id : string, name : string}>[],
    variationName : 'varone' | 'vartwo' | 'varthree'
} & React.SelectHTMLAttributes<HTMLSelectElement>>

const CustomSelect = forwardRef<HTMLSelectElement, SelectProps>(({name, values, className, variationName='varone', ...props}, ref) => {  

  const mergedClasses = twMerge(selectVariations[variationName], className)  

  return (    

    <>    

    <label htmlFor={name} className="bg-transparent">{capitalizeFirst(`${name}`)}</label>
    
      <select name={name} ref={ref} id={name} {...props} className={mergedClasses}>{
        values?
          values.map((value, index) =>

            <option key={`${value}-${index}`} id={value.id ? value.id : ''} value={value.id ? value.id : ''}>
              {value.name ? value.name : '...'}
            </option>

          ) 
        : ''
      }</select>
      
    </>

  )

})

export default CustomSelect

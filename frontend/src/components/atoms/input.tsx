import { twMerge } from "tailwind-merge";
import { inputVariations } from "../../utils/tailwindVariations";
import { TElementProps } from "../../utils/types";
import { capitalizeFirst } from "../../utils/useful-functions";

type TInputProps = TElementProps & React.InputHTMLAttributes<HTMLInputElement>

const CustomInput = ({name, className, variationName='varone', ...props} : TInputProps) => {

  const mergedClasses = twMerge(inputVariations[variationName], className)

  return (    

    <>    
      <label htmlFor={name} className="bg-transparent">{capitalizeFirst(`${name}`)}</label>
      <input {...props} name={name} id={name} className={mergedClasses} />
    </>

  )

}

export default CustomInput

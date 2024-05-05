import { FC } from "react"
import { HTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"
import { titleVariations } from "../../utils/tailwindVariations"

type TTitle = {
  value : string
  variationName ? : 'varone' | 'vartwo' | 'varthree'
} & HTMLAttributes<HTMLHeadingElement>

const CustomTitle : FC<TTitle> = ({value, className='', variationName='varone', ...props}) => {
  
  const mergedClasses = twMerge(titleVariations[variationName], className)

  return (

        <span className="flex flex-col justify-center items-center bg-transparent">
          <h3 className={mergedClasses} {...props}>{value}</h3>
        </span>

    )

}

export default CustomTitle

import { FC } from "react"
import { HTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

type TTitle = {
  value : string
  variationName ? : 'varone' | 'vartwo' | 'varthree'
} & HTMLAttributes<HTMLHeadingElement>

const titleVariations = {
  varone : 'text-red-500',
  vartwo : 'text-yellow-500',
  varthree : 'text-green-500'
}

const CustomTitle : FC<TTitle> = ({value, className='', variationName='varone', ...props}) => {
  
  const mergedClasses = twMerge(titleVariations[variationName], className)

  return (

        <span className="mb-5 flex flex-col justify-center items-center">
          <h3 className={mergedClasses} {...props}>{value}</h3>
        </span>

    )

}

export default CustomTitle

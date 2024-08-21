import { FC } from "react"
import { twMerge } from "tailwind-merge"

const TextPlaceholder : FC<{value : string, className ? : string}> = ({value, className}) => {

  const defaultClass = `text-gray-400 p-1 m-1`
  const mergedClasses = twMerge(defaultClass, className)

  return (    
    <p className={className ? mergedClasses : defaultClass}>
        {value}
    </p>
  )

}

export default TextPlaceholder

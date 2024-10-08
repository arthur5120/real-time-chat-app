import { twMerge } from "tailwind-merge";
import { TElementProps } from "../../utils/types";
import { inputVariations } from "../../utils/tailwindVariations";

type TButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, `value`> & TElementProps

const CustomButton = ({value, className, variationName='varone', ...props} : TButtonProps) => {

  const mergedClasses = twMerge(inputVariations[variationName], className)

  return (

    <>
      <button {...props} className={mergedClasses}>{value}</button>
    </>

  )

}

export default CustomButton

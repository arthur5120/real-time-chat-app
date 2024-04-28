import { FC } from 'react'
import CustomButton from '../atoms/button'

type TButtonGroup = {
    buttons : string[]
}

const ButtonGroup : FC<TButtonGroup> = ({buttons}) => {

  return (

    <>

        {
            buttons.map(
                (button, index) => <CustomButton key={`${button}${index}`} value={button} />
            )
        }
      
    </>

  )

}


export default ButtonGroup

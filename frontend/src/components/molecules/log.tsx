import { FC } from "react"
import TextPlaceholder from "../atoms/text-placeholder"

const Log : FC<{values : string[]}> = ({values}) => {

  return (

   <div className={`flex flex-col text-center`}>
        {
            values && values.length > 0 ? values.map((value) => {
                return (
                    <p className={`bg-black text-white rounded-xl italic m-1 p-1`}>
                        {value}
                    </p>
                )
            }) : <TextPlaceholder value={`Nothing here...`} />
        }   
   </div>

  )

}

export default Log

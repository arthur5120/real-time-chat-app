import { FC } from "react"

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
            }) : <p className={`text-gray-400`}>...</p>
        }   
   </div>

  )

}

export default Log

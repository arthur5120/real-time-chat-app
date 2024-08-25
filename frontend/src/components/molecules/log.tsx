import { FC } from "react"
import { TLog } from "../../utils/types"
import TextPlaceholder from "../atoms/text-placeholder"

const Log : FC<{values : TLog[]}> = ({values}) => {

  return (

   <div className={`flex flex-col text-center`}>
        Current Log
        {            
            values && values.length > 0 ? values.map((value) => {
                const {userName, roomName, date, content} = value                
                return (
                    <span className={`flex flex-col justify-center bg-slate-900 text-white rounded-xl italic m-1 p-1`}>
                        <p className={`flex gap-2 text-center justify-center`}>
                            <span className={`text-red-600`}>{date}</span>                                                        
                        </p>                        
                        <p>
                            <span className={`text-green-600 mr-1`}>{userName}</span>
                            <span className={`text-white`}>{`${content} on`}</span>
                            <span className={`text-yellow-600 ml-1`}>{roomName}</span>
                        </p>
                    </span>
                )
            }) : <TextPlaceholder value={`Nothing here...`}/>
        }   
   </div>

  )

}

export default Log

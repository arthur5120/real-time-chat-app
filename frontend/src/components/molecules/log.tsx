import { FC, forwardRef} from "react"
import { TLog } from "../../utils/types"
import { capitalizeFirst } from "../../utils/useful-functions"
import TextPlaceholder from "../atoms/text-placeholder"

//const Log : FC<{values : TLog[]}> = ({values}) => {

const Log = forwardRef<HTMLDivElement, {values : TLog[]}>(({values}, ref) => {
        return (
      
         <div className={`flex flex-col text-center`} ref={ref} id={`logdiv`}>            
              Current Log              
              {            
                  values && values.length > 0 ? values.map((value) => {
                      const {userName, roomName, time, content} = value                
                      return (
                          <span className={`flex flex-col justify-center bg-slate-900 text-white rounded-xl italic m-1 p-1`}>
                              <p className={`flextext-center justify-center`}>
                                  <span className={`text-red-600`}>{`${capitalizeFirst(`${userName}`)}`}</span>
                                  <span> - </span>
                                  <span className={`text-orange-600`}>{time}</span>                                                        
                              </p>                        
                              <p className={`flextext-center justify-center`}>
                                  <span className={`text-white`}>{`${capitalizeFirst(`${content}`)} on `}</span>
                                  <span className={`text-yellow-600`}>{roomName}</span>
                              </p>
                          </span>
                      )
                  }) : <TextPlaceholder value={`Nothing here...`}/>
              }   
         </div>
      
        )
      
      }
)

export default Log

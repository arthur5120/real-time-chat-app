import { forwardRef, useContext, useEffect, useState} from "react"
import { TLog } from "../../utils/types"
import { capitalizeFirst } from "../../utils/useful-functions"
import { sortAlphabeticallyByAny } from "../../utils/useful-functions"
import { toastContext } from "../../utils/contexts/toast-provider"
import TextPlaceholder from "../atoms/text-placeholder"


const Log = forwardRef<HTMLDivElement, {values : TLog[], filter : number}>(({values, filter}, ref) => {
    
        const {notifyUser} = useContext(toastContext)
        const [logList, setLogList] = useState<TLog[]>(values)

        useEffect(() => {
            switch (filter) {
                case 1 : 
                    setLogList(sortAlphabeticallyByAny(values, `userName`))
                break
                case 2 :
                    setLogList(sortAlphabeticallyByAny(values, `roomName`))
                break
                default: // chronologically
                break
            }            
        }, [values, filter])

        return (
      
         <div className={`flex flex-col text-center`} ref={ref} id={`logdiv`}>            
              Current Log              
              {            
                  logList && logList.length > 0 ? logList.map((value) => {
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

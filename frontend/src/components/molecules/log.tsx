import { forwardRef, useEffect, useState} from "react"
import { TLog } from "../../utils/types"
import { capitalizeFirst, sortChronogicallyByAny } from "../../utils/useful-functions"
import { sortAlphabeticallyByAny } from "../../utils/useful-functions"
import TextPlaceholder from "../atoms/text-placeholder"

const filterOrder = [
    `by date`,
    `by user name`,
    `by room name`,
]

const Log = forwardRef<HTMLDivElement, {values : TLog[], filter : number}>(({values, filter}, ref) => {
            
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
                    setLogList(sortChronogicallyByAny(values, `time`))
                break
            }    

        }, [values, filter])        

        return (
      
         <div className={`flex flex-col text-center`} ref={ref} id={`logdiv`}>            
              <h3>Current Log [{filter >= 0 ? filterOrder[filter] : filterOrder[0]}]</h3>
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

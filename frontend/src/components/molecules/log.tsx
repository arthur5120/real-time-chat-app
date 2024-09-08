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
                    console.log(`Log Component Message : Setting Log List to 1.`)
                    setLogList(sortAlphabeticallyByAny(values, `userName`, true))
                break
                case 2 :    
                    console.log(`Log Component Message : Setting Log List to 2.`)                
                    setLogList(sortAlphabeticallyByAny(values, `roomName`, true))
                break
                default: // chronologically
                    console.log(`Log Component Message : Setting Log List to 0.`)                
                    setLogList(sortChronogicallyByAny(values, `time`))
                break
            }    

        }, [values, filter])        

        return (
      
         <div className={`flex flex-col text-center`} ref={ref} id={`logdiv`}>            
              <h3>Current Log [{filter >= 0 ? filterOrder[filter] : filterOrder[0]}]</h3>
              {            
                  logList && logList.length > 0 ? logList.map((value, index) => {
                      const {userName, roomName, time, content} = value                
                      return (
                          <span className={`flex flex-col justify-center bg-slate-900 text-white rounded-xl italic m-1 p-1`} key={`log-entry-main-span-${index}`}>
                              <p className={`flextext-center justify-center`} key={`log-entry-p1-${index}`}>
                                  <span className={`text-red-600`} key={`log-entry-main-span-child1-${index}`} >{`${capitalizeFirst(`${userName}`)}`}</span>
                                  <span key={`log-entry-main-span-child2-${index}`} > - </span>
                                  <span className={`text-orange-600`} key={`log-entry-main-span-child3-${index}`} >{time}</span>                                                        
                              </p>                        
                              <p className={`flextext-center justify-center`} key={`log-entry-p2-${index}`}>
                                  <span className={`text-white`} key={`log-entry-main-span-child4-${index}`}>{`${capitalizeFirst(`${content}`)} on `}</span>
                                  <span className={`text-yellow-600`} key={`log-entry-main-span-child5-${index}`}>{roomName}</span>
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

import { forwardRef, useMemo} from "react"
import { TLog } from "../../utils/types"
import { capitalizeFirst, sortChronogicallyByAny } from "../../utils/useful-functions"
import { sortAlphabeticallyByAny } from "../../utils/useful-functions"
import TextPlaceholder from "../atoms/text-placeholder"

const filterOrder = [
    `date`,
    `user name`,
    `room name`,
]

type TProps = {
    values : TLog[], 
    order : number, 
    reverseOrder ? : boolean
}

const Log = forwardRef<HTMLDivElement, TProps>(({values, order, reverseOrder}, ref) => {  
    
        const logListTitle = `[sorted by ${order >= 0 ? filterOrder[order] : filterOrder[0]} - ${reverseOrder ? `inverted` : `default`}]`
        
        const getSortedValues = () => {

            let sortedLogList = values || []
            
            switch (order) {
                case 1 :
                    console.log(`Log Component Message : Setting Log List to ${order}. By User Name`)                    
                    sortedLogList = sortAlphabeticallyByAny(values, `userName`, reverseOrder)
                    console.log(sortedLogList)
                return sortedLogList                
                case 2 :    
                    console.log(`Log Component Message : Setting Log List to ${order}. By Room Name`)                                    
                    sortedLogList = sortAlphabeticallyByAny(values, `roomName`, reverseOrder)
                    console.log(sortedLogList)  
                return sortedLogList
                default:
                    console.log(`Log Component Message : Setting Log List to ${order}. By Time and Date`)                    
                    sortedLogList = sortChronogicallyByAny(values, `time`, reverseOrder)
                    console.log(sortedLogList)                    
                return sortedLogList
            }

        }
        
        const memoizedSortedValues = useMemo(() => {
            return getSortedValues()
        }, [values, order, reverseOrder])

        return (
      
         <div className={`flex flex-col text-center`} ref={ref} id={`logdiv`}>            
              <h3>{logListTitle}</h3>
              {            
                values && values.length > 0 ? memoizedSortedValues.map((value, index) => {
                      const {userName, roomName, visualTime, content} = value                
                      return (
                          <span className={`flex flex-col justify-center bg-slate-900 text-white rounded-xl italic m-1 p-1`} key={`log-entry-main-span-${index}`}>
                              <p className={`flextext-center justify-center`} key={`log-entry-p1-${index}`}>
                                  <span className={`text-red-600`} key={`log-entry-main-span-child1-${index}`} >{`${capitalizeFirst(`${userName}`)}`}</span>
                                  <span key={`log-entry-main-span-child2-${index}`} > - </span>
                                  <span className={`text-orange-600`} key={`log-entry-main-span-child3-${index}`} >{visualTime}</span>                                                        
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

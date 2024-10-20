import { FC, memo, useMemo } from 'react'
import { cropMessage } from '../../utils/useful-functions'
import { TChatMessage } from '../../utils/types'

export type TMessageTime = {    
    messageUpdatedAt : string,
    messageCreatedAt : string,
    showUpdatedAt : boolean,      
    messages : TChatMessage[],
} 

const MessageTime : FC<TMessageTime> = memo(({messageUpdatedAt, messageCreatedAt, showUpdatedAt, messages}) => {      

    const memoizedMessageTime = useMemo(() => {             
        return (              
            <h5 className='bg-transparent text-sm cursor-pointer' title={`Created : ${messageCreatedAt} ${messageUpdatedAt != `` ? `\nUpdated : ${messageUpdatedAt}` : ``}`}>
                <time>
                    {cropMessage(messageCreatedAt, 15)}
                </time>
                <time className={`text-slate-300 italic`}>
                    {showUpdatedAt ? ` 📝(${cropMessage(messageUpdatedAt, 15)})` : ``}
                </time>
            </h5>                        
          )          
    }, [messages])

    return memoizedMessageTime
    
})

export default MessageTime

import { useEffect, useState } from 'react'

type TMessage = {
  user : string,  
  content : string
  when : number
}

const Chat = () => {

  const [currentUser, setCurrentUser] = useState<string>('John')
  const [messages, setMessages] = useState<TMessage[]>([])
  const [message, setMessage] = useState<TMessage>({user : '', content : '', when : 0})

  const getTime = (value : number) => {
    const timeNow = Date.now()
    const diff = timeNow - value
    const timeSeconds = Math.min((diff) / 1000, 59) | 0
    const timeMinutes = Math.min((diff) / 60000, 59) | 0
    const timeHours = Math.min((diff) / 3600000, 23) | 0
    const timeDays = Math.floor((diff) / 86400000) | 0
    return `
    ${timeHours > 0 ? timeHours + 'h' : ''}
    ${timeMinutes > 0 ? timeMinutes + 'm' : ''}
    ${timeSeconds > 0 ? timeSeconds + 's' : ''}
    ${timeDays > 0 ? timeDays + 'd' : ''}
    ${ (diff < 1000) ? 'Now' : 'ago'}`
  }
  
  const sendMessage = () => {
    setMessages((values) => ([
      ...values,
      message
    ]))
    
    setMessage({
      ...message, content : ''
    })

  }

  const updateMessage = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage({user : currentUser, content : e.target.value, when : Date.now()})
  }

  useEffect(() => {
  }, [])
  
  return (    
    
    <section className='flex flex-col gap-3 bg-transparent justify-center items-center text-center'>

      <div className='flex justify-between bg-gray-700 rounded w-80'>
        <h3 className='bg-transparent justify-start m-2'>Logged in as {currentUser}</h3>
        <span className=' bg-transparent m-2 cursor-pointer'>X</span>
      </div>

      <div className='flex flex-col gap-1 bg-gray-500 rounded w-80 h-80 overflow-y-scroll'>        
        {messages?.map(message => 
          <>
            <span className={`${currentUser == message.user ? 'self-end' : 'self-start'} mx-3 p-2 justify-end bg-transparent`}>
              <h4 className='bg-transparent text'>{currentUser == message.user ? 'You' : message.user}</h4>
            </span>
            <span className={`${currentUser == message.user ? 'self-end' : 'self-start'} mx-3 p-2 bg-gray-700 rounded max-w-48 h-fit break-words`}>
              <h5 className='bg-transparent'>{message.content}</h5>
            </span>
            <span className={`${currentUser == message.user ? 'self-end' : 'self-start'} mx-3 p-2 justify-end bg-transparent`}>
              <h5 className='bg-transparent text-sm'>{getTime(message.when)}</h5>
            </span>
          </>
        )}
      </div>

      <div className='flex bg-gray-700 rounded w-80 h-15 gap-2 p-1'>

        <textarea 
          name='' 
          id='' 
          className='items-start bg-gray-500 text-white rounded-lg resize-none p-1 m-1' 
          cols={41} 
          rows={3} 
          onChange={(e) => {updateMessage(e)}}
          placeholder='Say something...'          
          value={message.content}
        />

        <button 
          className='p-2 bg-orange-500 rounded-lg m-1' 
          onClick={() => sendMessage()}>Send
        </button>


      </div>

      <button onClick={() => setCurrentUser(currentUser == 'John' ? 'Steve' : 'John')} className='bg-purple-500 rounded-lg p-5 m-2'>
        Change User
      </button>

    </section>    
    
  )
  
}


export default Chat

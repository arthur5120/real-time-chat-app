import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { authStatus, createMessage, getChats, getMessages, getUserById, } from '../../hooks/useAxios'
import { TUser, TRes, TMessage, TChatMessage } from '../../utils/types'
import { userPlaceholder, messagePlaceholder } from '../../utils/placeholders'
import { getTime } from '../../utils/useful-functions'

import CustomSelect from '../atoms/select'
import CustomButton from '../atoms/button'
import { authContext } from '../../utils/auth-provider'

const Chat = () => {

  const [currentUser, setCurrentUser] = useState<TUser>(userPlaceholder)
  const [rooms, setRooms]  = useState<{id : string}[] | null>(null)
  const [message, setMessage] = useState<TChatMessage>(messagePlaceholder) 
  const [messages, setMessages] = useState<TChatMessage[]>([])   
  const {auth} = useContext(authContext)

  const chatContainerRef = useRef<HTMLDivElement>(null);  

  const memoizedRooms = useMemo(() => {
    rooms
  }, [rooms, auth])

  const memoizedMessages = useMemo(() => {
    messages
  }, [messages, auth])
  
  const sendMessage = async() => {

    if (currentUser) {

      const user = await authStatus({})

      await createMessage(
        user.id, 
        message.room, 
        message.content
      )

    }

    setMessages((values) => ([
      ...values,
      message,
    ]))
    
    setMessage({
      ...message, content : ''
    })

  }

  const updateMessage = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage({
      user : currentUser?.name ? currentUser?.name : 'Guest',
      content : e.target.value, 
      when : Date.now(),
      room : rooms ? rooms[0].id : 'none'
    })
  }

  const retrieveMessages = async () => {
    const chatMessages = await getMessages()
    return chatMessages
  }
  
  const getCredentials = async () => {

    

    const res = await authStatus({}) as TRes

    if (res.authenticated) {
      const user = await getUserById(res.id)        
      setCurrentUser(user)
    }
    
  }

  const getRooms = async () => {    

    const authInfo = await authStatus({})
    const user = await getUserById(authInfo.id)
    const chatRooms = await getChats()    
    const storedMessages = await retrieveMessages()

    setRooms(chatRooms)

    const roomMessages = storedMessages.filter(
      (m : TMessage) => (m.chatId == chatRooms[0].id && m.senderId == authInfo.id)
    )

    roomMessages.map((m : TMessage) => {      

      const lastUpdated = new Date(m.updated_at).getTime()

      const roomMessage = {
        user : user.name, 
        content : m.content,
        when : lastUpdated,
        room : m.chatId
      }
    
      setMessages((rest) => ([
        roomMessage,
        ...rest,
      ]))
      
    })   
    
    
    
  }  

  const setScroll = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }

  // Deps : current user, rooms, messages

  useEffect(() => {
    getCredentials()
    getRooms()    
  }, [memoizedRooms])

  useEffect(() => {
    setScroll()
  }, [memoizedMessages])

  return (    
    
    <section className='flex flex-col gap-3 bg-transparent justify-center items-center text-center'>

      <div className='flex justify-between bg-gray-700 rounded w-80'>
        <h3 className='bg-transparent justify-start m-2'>
            {currentUser?.name ? `Logged in as ${currentUser.name}` : `Chatting as Guest`}
        </h3>
        <span className=' bg-transparent m-2 cursor-pointer'>X</span>
      </div>

      <div className='flex flex-col gap-1 bg-gray-500 rounded w-80 h-80 overflow-y-scroll' ref={chatContainerRef}> 
        {messages?.map(message => 
          <>
            <span className={`${currentUser.name == message.user ? 'self-end' : 'self-start'} mx-3 p-2 justify-end bg-transparent`}>
              <h4 className='bg-transparent text'>{currentUser.name == message.user ? 'You' : message.user}</h4>
            </span>
            <span className={`${currentUser.name == message.user ? 'self-end' : 'self-start'} mx-3 p-2 bg-gray-700 rounded max-w-48 h-fit break-words`}>
              <h5 className='bg-transparent'>{message.content}</h5>
            </span>
            <span className={`${currentUser.name == message.user ? 'self-end' : 'self-start'} mx-3 p-2 justify-end bg-transparent`}>
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

        <CustomButton 
          className='p-2 bg-orange-500 rounded-lg m-1' 
          onClick={() => sendMessage()} 
          value={'Send'} 
        />

      </div>

      {rooms ? <CustomSelect name='Chat Rooms' values={
        rooms.map(room => {
          return {name : room.id}
        })
      }/> : ''}      

    </section>    
    
  )
  
}


export default Chat
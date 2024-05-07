import { useContext, useEffect, useRef, useState } from 'react'
import { authStatus, createChat, createMessage, getChats, getMessages, getUserById, } from '../../hooks/useAxios'
import { TUser, TMessage, TChatMessage } from '../../utils/types'
import { userPlaceholder, messagePlaceholder } from '../../utils/placeholders'
import { getTime } from '../../utils/useful-functions'
import { socketContext } from '../../utils/socket-provider'

import CustomSelect from '../atoms/select'
import CustomButton from '../atoms/button'

const Chat = () => {

  const [currentUser, setCurrentUser] = useState<TUser>(userPlaceholder)
  const [roomIndex, setRoomIndex] = useState(0)
  const [rooms, setRooms] = useState<{id : string}[] | null>(null)
  const [message, setMessage] = useState<TChatMessage>(messagePlaceholder) 
  const [messages, setMessages] = useState<TChatMessage[]>([])
  const [reload, setReload] = useState(true)

  const chatContainerRef = useRef<HTMLDivElement>(null) 
  const socket = useContext(socketContext) 

  const scrollToLatest = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }

  const retrieveMessages = async () => {
    const chatMessages = await getMessages()       
    return chatMessages
  }
  
  const sendMessage = async() => {  

    const newMessage = {
        user: currentUser.name,
        content: message.content,
        when: Date.now(),
        room:  message.room,
    }
    
    socket?.connect()
    socket?.emit('room', newMessage)
    scrollToLatest()    

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

    scrollToLatest()

  }

  const updateMessage = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage({
      user : currentUser?.name ? currentUser?.name : 'Guest',
      content : e.target.value, 
      when : Date.now(),
      room : rooms ? rooms[roomIndex].id : 'none'
    })
  }

  const setPrep = async () => {    

    const authInfo = await authStatus({})
    const user = await getUserById(authInfo.id)
    const chatRooms = await getChats()    
    const storedMessages = await retrieveMessages()    

    authInfo.authenticated ? setCurrentUser(user) : ''
    
    if(chatRooms?.length == 0) {
      await createChat()
    }
    
    setRooms(chatRooms)

    const roomMessages = storedMessages.filter(
      (m : TMessage) => {        
        if (m.chatId == chatRooms[roomIndex].id) {          
          return m
        }
      }
    )
    
    const messageArray : TChatMessage[] = []

    roomMessages.map((m : TMessage) => {      

      const lastUpdated = new Date(m.updated_at).getTime()

      const roomMessage = {
        user : m.senderId == authInfo.id ? user.name : 'Other Person',
        content : m.content,
        when : lastUpdated,
        room : m.chatId
      }

      messageArray.push(roomMessage)

    })
    
    messageArray.sort((a, b) => a.when - b.when)

    socket?.emit('room', messageArray)        

    //setMessages(messageArray)
    
  }  

  // Deps : current user, rooms, messages | auth, room?.id, messages.length

  useEffect(() => {

    socket?.connect()

    if (reload) {
      setPrep()   
      
    }

    socket?.on('room', (socketMessages) => {
      setMessages(socketMessages)
    })

    scrollToLatest()   

    return () => {
      socket?.disconnect()
      setReload(false)
    }
    
  }, [roomIndex, messages.length, reload, socket?.connected])

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
      
      {rooms ? <CustomSelect name='Chat Rooms' onChange={(e) => (setRoomIndex(e.target.selectedIndex))} values={
        rooms.map((room) => {
          return {name : room.id}
        })
      }/> : ''}     

      <CustomButton 
        value={'Force Reload'} 
        className='bg-yellow-600' 
        onClick={() => {

          setReload(!reload)
          socket?.connect()
          
          return () => {
            socket?.disconnect()
          }

        }}
      />

    </section>    
    
  )
  
}


export default Chat
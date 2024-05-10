import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { authStatus, createChat, createMessage, deleteChat, getChats, getMessages, getUserById, } from '../../hooks/useAxios'
import { TUser, TMessage, TChatMessage } from '../../utils/types'
import { userPlaceholder, messagePlaceholder } from '../../utils/placeholders'
import { convertDatetimeToMilliseconds, getTime, sortByMilliseconds } from '../../utils/useful-functions'
import { socketContext } from '../../utils/socket-provider'

import CustomSelect from '../atoms/select'
import CustomButton from '../atoms/button'

const Chat = () => {

  const [currentUser, setCurrentUser] = useState<TUser>(userPlaceholder)
  const [rooms, setRooms] = useState<{id : string}[]>([{id : '0'}])
  const [currentRoom, setCurrentRoom] = useState<{id : string, selectId : number}>({id : '-1', selectId : 0})  
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

  const retrieveCurrentUser = async () => {

    const authInfo = await authStatus({})
    const user = await getUserById(authInfo.id)

    setCurrentUser({
      name : user.name,
      username : user.username,
      email : user.email,      
      role : authInfo.role,
    })

  }

  const retrieveRooms = async () => {

    const rooms = await getChats()  
    
    if(rooms.length <= 0) {
      await createChat()
    }
    
    setRooms(rooms)

  }

  const retrieveMessages = async () => {  
    
    const authInfo = await authStatus({})

    const rawMessages = await getMessages()       
    
    const filteredMessages = rawMessages.filter((m : TMessage) => m.chatId == currentRoom.id)

    const convertedMessages = filteredMessages.map((m : TMessage) => ({
      user: m.senderId == authInfo.id ? currentUser.name : `Unknown`,
      content: m.content,
      when: convertDatetimeToMilliseconds(m.updated_at),
      room: m.chatId,     
    }))   
        
    const sortedMessages = sortByMilliseconds(convertedMessages)    

    setMessages(sortedMessages)

  }

  const sendMessage = async () => {   

    const userInfo = await authStatus({})    

    await createMessage(
      userInfo.id,
      currentRoom.id,
      message.content,
    )    

    setReload(true)    
  }
  
  const resetCurrentRoom = async () => {
    if (currentRoom.id == '-1' || currentRoom.id == '0') {
      setCurrentRoom({id : rooms[0].id, selectId : 0})
    }
  }

  const onSelectChange = (e : React.ChangeEvent<HTMLSelectElement>) => {
    const roomId = e.target.value
    const selectId = e.target.selectedIndex
    setCurrentRoom({id : roomId, selectId : selectId})
    setReload(true)
  }

  const onTextareaChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage((rest) => ({
      ...rest,
      content : e.target.value,
      room : rooms[0].id,
      when : Date.now(),
    }))
  }

  const initialSetup = async () => {
    retrieveCurrentUser()
    retrieveRooms()
    resetCurrentRoom()
    retrieveMessages()
    scrollToLatest()    
  }

  useEffect(() => {
    initialSetup()
    setReload(false)
  }, [rooms?.length, messages?.length, currentRoom.id, reload])

  return (
    
    <section className='flex flex-col gap-3 bg-transparent justify-center items-center text-center'>     

      <div>{JSON.stringify(currentRoom)}</div>
      <div>{JSON.stringify(currentUser)}</div>

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
          onChange={(e) => {onTextareaChange(e)}}
          placeholder='Say something...'
          value={message.content}
        />

        <CustomButton
          className='p-2 bg-orange-500 rounded-lg m-1'
          onClick={() => sendMessage()}
          value={'Send'}
        />

      </div>
      
      {rooms ? <CustomSelect name='Chat Rooms' onChange={(e) => onSelectChange(e)} values={
        rooms.map((room) => {
          return {name : room.id}
        })
      }/> : ''}

     <div>

      <CustomButton 
        value={'Reset Chats'} 
        className='bg-purple-500' 
        onClick={() => alert()}
      />

      <CustomButton 
        value={'Test Stuff'} 
        className='bg-red-500' 
        onClick={() => alert()}
      />

     </div>

    </section>    
    
  )
  
}


export default Chat
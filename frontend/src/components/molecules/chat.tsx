import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { authStatus, createChat, createMessage, deleteChat, getChats, getMessages, getUserById, } from '../../hooks/useAxios'
import { TUser, TMessage, TChatMessage } from '../../utils/types'
import { userPlaceholder, messagePlaceholder } from '../../utils/placeholders'
import { convertDatetimeToMilliseconds, getTime, sortByMilliseconds } from '../../utils/useful-functions'
import { socketContext } from '../../utils/socket-provider'
import { ToastContainer, toast } from 'react-toastify'
import { TypeOptions } from 'react-toastify'

import CustomSelect from '../atoms/select'
import CustomButton from '../atoms/button'

import "react-toastify/ReactToastify.css"

const Chat = () => {

  const [currentUser, setCurrentUser] = useState<TUser>(userPlaceholder)
  const [rooms, setRooms] = useState<{id : string}[]>([{id : '-1'}])
  const [currentRoom, setCurrentRoom] = useState<{id : string, selectId : number}>({id : '-1', selectId : 0})  
  const [message, setMessage] = useState<TChatMessage>(messagePlaceholder) 
  const [messages, setMessages] = useState<TChatMessage[]>([])
  const [reload, setReload] = useState(1)
  const [reloadCount, setReloadCount] = useState(0)
  
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const socket = useContext(socketContext)

  const notifyUser = (notification : string, type : TypeOptions = 'info') => toast.info(notification, { // Export this to a reusable component later
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    className : 'bg-slate-800',
    type : type,
  })

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

    const localRooms = await getChats()  
    
    if(localRooms.length <= 0) {
      await createChat()
    }

    if (currentRoom.id == '-1' || currentRoom.id == '0') {
      setCurrentRoom({id : localRooms[0].id, selectId : 0})
    }
    
    setRooms(localRooms) // Only loads on next rendering

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

  const addMessage = async (newMessage : TChatMessage) => {
    setMessages((rest) => ([
      ...rest, 
      newMessage
    ]))
  }

  const resetMessageContent = () => {
    setMessage((rest) => ({
      ...rest,
      content : ''
    }))
  }

  const sendMessage = async () => {  
    
    const localMessage : TChatMessage = {      
      user : currentUser?.name ? currentUser.name : '',
      content : message.content,
      when : Date.now(),
      room : currentRoom.id,
    }

    if(localMessage.content.trim() == "") {
      notifyUser('Write something first!')
      return
    }

    socket?.connect()

    const userInfo = await authStatus({})

    await createMessage(
      userInfo.id,
      currentRoom.id,
      localMessage.content,
    )  
    
    socket?.emit('room', localMessage)   
    addMessage(localMessage)
    resetMessageContent()

  }

  const createRoom = async () => {
    createChat()
    notifyUser('New Room Created!', 'success')
    setReload(reload + 1)
  }

  const deleteAllRooms = async () => {
    let i
    for (i=0 ; i < rooms.length ; i++) {
      await deleteChat(rooms[i].id)
    }    
    await retrieveRooms()
    notifyUser('All rooms deleted, a fresh one was created', 'success')
    setReload(reload + 1)
  }

  const onSelectChange = (e : React.ChangeEvent<HTMLSelectElement>) => {
    const roomId = e.target.value
    const selectId = e.target.selectedIndex
    setCurrentRoom({id : roomId, selectId : selectId})
    setReload(reload + 1)
  }

  const onTextareaChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {    
    setMessage((rest : TChatMessage) => ({
      ...rest,      
      content : e.target.value,     
    }))
  }

  const initialSetup = async () => {                 
      setReloadCount(reloadCount + 1)
      await retrieveCurrentUser()
      await retrieveRooms()         
      await retrieveMessages()
      await resetMessageContent()
  }

  // rooms, messages, currentRoom, reload

  useEffect(() => {

    if(reload > 0) {
      initialSetup()
    }

    socket?.connect()

    socket?.on('room', (msg : TChatMessage) => {
      const {room} = msg       
       if (room === currentRoom.id) {
         addMessage(msg)
       } else {
        notifyUser(`A new message in ${room}!`)
       }
     })

     return () => {

        socket?.disconnect()
        socket?.off()      
        
        if (currentRoom.id == '0' || currentRoom.id == '-1') {
          setReload(reload + 1)
        } else {
          setReload(0)
        }

        scrollToLatest()

     }

  }, [rooms.length, messages.length, currentRoom.id, reload])

  

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
          className='items-start bg-gray-500 text-white rounded-lg resize-none p-1 m-1 h-full w-full'
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
      
      {rooms ? <CustomSelect name='Current Chat Room' onChange={(e) => onSelectChange(e)} values={
        rooms.map((room) => {
          return {name : room.id}
        })
      }/> : ''}

     <div>

      <CustomButton 
        value={'Reset Chat Rooms'}
        className='bg-purple-500' 
        onClick={() => deleteAllRooms()}
      />

      
      <CustomButton 
        value={'Create Chat'} 
        className='bg-green-500' 
        onClick={() => createRoom()}
      />

      <ToastContainer      
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* <div className='flex justify-center items-center gap-3'>
        <span>RELOAD VARIABLE {reload > 0 ? <h5 className='text-green-500'>yay</h5>: <h5 className='text-red-500'>nay</h5>}</span>
        <span>RELOAD COUNT <h5>{reloadCount}</h5></span>
        <span>RELOAD VALUE <h5>{reload}</h5></span>
      </div>       */}

     </div>

    </section>    
    
  )
  
}


export default Chat
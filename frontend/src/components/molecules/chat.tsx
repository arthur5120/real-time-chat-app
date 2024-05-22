import { useContext, useEffect, useRef, useState, Fragment } from 'react'
import { addUserToChat, authStatus, createChat, createMessage, deleteChat, getChats, getMessages, getUserById, } from '../../hooks/useAxios'
import { TUser, TMessage, TChatMessage } from '../../utils/types'
import { userPlaceholder, messagePlaceholder } from '../../utils/placeholders'
import { convertDatetimeToMilliseconds, getTime, sortByMilliseconds } from '../../utils/useful-functions'
import { socketContext } from '../../utils/contexts/socket-provider'
import { toastContext } from '../../utils/contexts/toast-provider'
import { primaryDefault, secondaryDefault } from '../../utils/tailwindVariations'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

import CustomSelect from '../atoms/select'
import CustomButton from '../atoms/button'

const roomsPlaceholder = [{id : '-1', name : ''}]
const currentRoomPlaceHolder = {id : '-1', selectId : 0, name : ''}

type TCurrentRoom = {id : string, selectId : number, name : string}
type TRooms = {id : string, name : string}[]

const Chat = () => {

  const [currentUser, setCurrentUser] = useState<TUser>(userPlaceholder)
  const [rooms, setRooms] = useState<TRooms>(roomsPlaceholder)
  const [currentRoom, setCurrentRoom] = useState<TCurrentRoom>(currentRoomPlaceHolder)
  const [message, setMessage] = useState<TChatMessage>(messagePlaceholder) 
  const [messages, setMessages] = useState<TChatMessage[]>([])
  const [reload, setReload] = useState(1)  
  const [chatHidden, setChatHidden] = useState(false)
  
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const socket = useContext(socketContext)
  const {notifyUser} = useContext(toastContext)

  const scrollToLatest = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }

  const retrieveCurrentUser = async () => {

    try {

      const authInfo = await authStatus({})
      const user = await getUserById(authInfo.id)
  
      setCurrentUser({
        name : user.name,
        username : user.username,
        email : user.email,
        role : authInfo.role,
      })

    } catch(e) {
      notifyUser(`Something Went Wrong`, `error`)
    }

  }

  const retrieveRooms = async () => {

    try {

      const localRooms = await getChats()
      const isRoomIdEmpty = currentRoom.id == '-1' || currentRoom.id == '0'
      const hasNoRooms = localRooms?.length <= 0
      const isFirstRoomValid = !! localRooms[0]
      
      if(hasNoRooms) {
        await createChat()
      }

      const isRoomIdValid = !isRoomIdEmpty ? localRooms.some((room : TCurrentRoom) => room.id.trim() == currentRoom.id.trim()) : false    

      if (isRoomIdEmpty || !isRoomIdValid && isFirstRoomValid) {      
        setCurrentRoom({id : localRooms[0].id, selectId : 0, name : ''})
      }

      setRooms(localRooms) // Only loads on next rendering

    } catch (e) {
      notifyUser(`Something Went Wrong`, `error`)
    }
    
  }

  const retrieveMessages = async () => {  
    
      try {

        const authInfo = await authStatus({})

        const rawMessages = await getMessages()         
        
        const filteredMessages = rawMessages.filter((m : TMessage) => m.chatId == currentRoom.id)
    
        const convertedMessages = filteredMessages.map((m : TMessage) => ({
          user: m.senderId == authInfo.id ? currentUser.name : m.senderName,
          content: m.content,
          when: convertDatetimeToMilliseconds(m.updated_at),
          room: m.chatId,     
        }))   
            
        const sortedMessages = sortByMilliseconds(convertedMessages)
    
        setMessages(sortedMessages)

      } catch (e) {
        notifyUser(`Something Went Wrong`,`error`)
      }

  }

  const addMessage = async (newMessage : TChatMessage) => { // Removed Async
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
    
    try {

      const localMessage : TChatMessage = {
        user : currentUser?.name ? currentUser.name : '',
        content : message.content,
        when : Date.now(),
        room : currentRoom.id,
      }
  
      if(localMessage.content.trim() == '') {
        notifyUser('Write something first!')
        return
      }
  
      socket?.connect()
  
      const userInfo = await authStatus({})

      if (!userInfo.authenticated) {
        notifyUser('Not Allowed!', 'error')        
        resetMessageContent()
        return
      }
  
      await createMessage(
        userInfo.id,
        currentRoom.id,
        localMessage.content,    
        localMessage.user
      )

      await addUserToChat(userInfo.id, currentRoom.id) // Adding user to chat without checking.
      
      socket?.emit('room', localMessage)   
      addMessage(localMessage)
      resetMessageContent()

    } catch (e) {
      notifyUser(`Something went wrong`, `warning`)
    }

  }

  const createRoom = async () => {

    try {

      const creationMessage = `New Room Created!`
      const userInfo = await authStatus({})

      if (!userInfo.authenticated) {
        notifyUser('Not Allowed!', 'error')
        return
      } 

      createChat()
      notifyUser(creationMessage, 'success')
      socket?.emit('change', creationMessage)
      setReload(reload + 1)      

    } catch (e) {
      notifyUser(`Something went wrong`, `warning`)
    }

  }

  const deleteAllRooms = async () => {

    try {

      let i
      const deletionMessage = `All rooms deleted, a fresh one was created`
  
      const userInfo = await authStatus({})
  
      if (!userInfo.authenticated || userInfo.role != 'Admin') {
        notifyUser('Not Allowed!', 'error')
        return
      }
    
      for (i=0 ; i < rooms.length ; i++) {
        await deleteChat(rooms[i].id)
      }
      
      await retrieveRooms()
      
      socket?.emit('change', deletionMessage)
    
      notifyUser(deletionMessage, 'success')    
      setReload(reload + 1)

    } catch (e) {
      console.log(e)
      notifyUser(`Something went wrong`, `warning`)
    }

  }

  const onSelectChange = (e : React.ChangeEvent<HTMLSelectElement>) => {        
    const roomId = e.target.value
    const selectId = e.target.selectedIndex
    setCurrentRoom({id : roomId, selectId : selectId, name : ''}) // Try room names here
    setReload(reload + 1)
  }

  const onTextareaChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {    
    setMessage((rest : TChatMessage) => ({
      ...rest,      
      content : e.target.value,     
    }))
  }

  const onResetRoomsClick = async () => {    
    setCurrentRoom({ id: '-1', selectId: 0, name : ''})
    await deleteAllRooms()
  }

  const initialSetup = async () => {        
    await retrieveCurrentUser()
    await retrieveRooms()         
    await retrieveMessages()
    resetMessageContent()
  }

  useEffect(() => {    

    if(reload > 0) {
      initialSetup()
    }

    socket?.connect()

    socket?.on('room', (msg : TChatMessage) => {
      const {room} = msg       
      if (room === currentRoom.id) {
        console.log(`Room from server : ${room}, Local Room ${currentRoom.id}`)
        addMessage(msg)
      } else {
        console.log(`Room from server : ${room}, Local Room ${currentRoom.id}`)
        notifyUser(`A new message in ${room}!`)
      }
    })

     socket?.on('change', (msg : string) => {
      if(msg) {                
        notifyUser(msg, 'info')
        setReload(reload + 1)
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

      <div className={`flex justify-between ${primaryDefault} rounded-lg w-80`}>
        <h3 className='bg-transparent justify-start m-2'>
            {currentUser?.name ? `Logged in as ${currentUser.name}` : `Chatting as Guest`}
        </h3>
        <span className=' bg-transparent m-2 cursor-pointer mx-4'>
          <button title={`Toggle Hide/Show Chat`} onClick={() => setChatHidden(!chatHidden)}>
            {chatHidden ? <FontAwesomeIcon icon={faEyeSlash}/> : <FontAwesomeIcon icon={faEye}/>}
          </button>
        </span>
      </div>

      <div className={`flex flex-col gap-1 ${secondaryDefault} rounded-lg w-80 h-80 overflow-y-scroll ${chatHidden ? 'hidden' : ''}`} ref={chatContainerRef}> 
        {messages?.map((message, id) => 
          <Fragment key={`msg-${id}`}>
            <span className={`${currentUser.name == message.user ? 'self-end' : 'self-start'} mx-3 p-2 justify-end bg-transparent`}>
              <h4 key={`msg-user-${id}`} className='bg-transparent text'>{currentUser.name == message.user ? 'You' : message.user}</h4>
            </span>
            <span className={`${currentUser.name == message.user ? 'self-end' : 'self-start'} mx-3 p-2 ${primaryDefault} rounded max-w-48 h-fit break-words`}>
              <h5 key={`msg-content-${id}`}  className='bg-transparent'>{message.content}</h5>
            </span>
            <span className={`${currentUser.name == message.user ? 'self-end' : 'self-start'} mx-3 p-2 justify-end bg-transparent`}>
              <h5 key={`msg-when-${id}`}  className='bg-transparent text-sm'>{getTime(message.when)}</h5>
            </span>
          </Fragment>
        )}
      </div>

      <div className={`flex ${primaryDefault} rounded-lg w-80 h-15 gap-2 p-1`}>                

        <textarea 
          name=''
          id=''
          className={`items-start ${secondaryDefault} text-white rounded-lg resize-none p-1 m-1 h-full w-full`}
          cols={41}
          rows={3}
          onChange={(e) => {onTextareaChange(e)}}
          placeholder={`Say something...`}
          value={message.content}
        />

        <CustomButton
          className='p-2 bg-[#aa5a95] text-white rounded-lg m-1'
          onClick={() => sendMessage()}
          value={'Send'}
        />

      </div>
      
      {rooms ? <CustomSelect name='Current Chat Room' onChange={(e) => onSelectChange(e)} className={`bg-slate-900`} values={
        rooms.map((room) => {
          return {name : room.id}
        })
      } value={currentRoom.id}/> : ''}

     <div>

      <CustomButton 
        value={'Reset Rooms'}
        variationName='vartwo'
        onClick={() => onResetRoomsClick()}
      />

      <CustomButton 
        value={'New Room'}
        variationName='varthree'
        onClick={() => {          
          createRoom()
        }}
      />      

      {/* <div className='flex justify-center items-center gap-3'>
        <span>RELOAD REQUIRED {reload > 0 ? <h5 className='text-green-500'>Yep</h5>: <h5 className='text-red-500'>Nah</h5>}</span>        
        <span>ROOM ID <h5>{currentRoom.id}</h5></span>
      </div> */}

     </div>

    </section>    
    
  )
  
}


export default Chat
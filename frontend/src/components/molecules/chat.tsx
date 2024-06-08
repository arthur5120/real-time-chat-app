import { useContext, useEffect, useRef, useState, Fragment } from 'react'
import { addUserToChat, authStatus, createChat, createMessage, deleteAllChats, deleteMessage, getChats, getMessages, getUserById, updateMessage, } from '../../hooks/useAxios'
import { TUser, TMessage, TChatMessage } from '../../utils/types'
import { userPlaceholder, messagePlaceholder } from '../../utils/placeholders'
import { convertDatetimeToMilliseconds, getTime, sortByMilliseconds } from '../../utils/useful-functions'
import { authContext } from '../../utils/contexts/auth-provider'
import { socketContext } from '../../utils/contexts/socket-provider'
import { toastContext } from '../../utils/contexts/toast-provider'
import { primaryDefault, secondaryDefault } from '../../utils/tailwindVariations'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

import CustomSelect from '../atoms/select'
import CustomButton from '../atoms/button'

const roomsPlaceholder = [{id : '-1', name : ''}]
const currentRoomPlaceHolder = {id : '-1', selectId : 0, name : ''}

type TCurrentRoom = {id : string, selectId : number, name : string}
type TRooms = {id : string, name : string}[]

const Chat = () => {
  
  let chatContainerRef = useRef<HTMLDivElement>(null)
  let messageContainerRef =  useRef<HTMLSpanElement>(null)

  const [rooms, setRooms] = useState<TRooms>(roomsPlaceholder)
  const [currentUser, setCurrentUser] = useState<TUser>(userPlaceholder)
  const [currentRoom, setCurrentRoom] = useState<TCurrentRoom>(currentRoomPlaceHolder)
  const [message, setMessage] = useState<TChatMessage>(messagePlaceholder)
  const [roomUsers, setRoomUsers] = useState<string[]>([])
  const [messages, setMessages] = useState<TChatMessage[]>([])  
  const [messageBeingEdited, setMessageBeingEdited] = useState<TChatMessage & {previous ? : string}>(messagePlaceholder)  
  const [hasErrors, setHasErrors] = useState(false)
  const [chatHidden, setChatHidden] = useState(false)  
  const [reload, setReload] = useState(1)
  const [delay, setDelay] = useState(0)

  const isCurrentRoomIdValid = currentRoom.id == '0' || currentRoom.id == '-1'

  const {auth} = useContext(authContext)
  const socket = useContext(socketContext)
  const {notifyUser} = useContext(toastContext)

  const scrollToLatest = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
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
      setHasErrors(true)
    }

  }

  const createRoomIfNoneAreFound = async () => {          

    try {

      const localRooms = await getChats()
      const hasValidRooms = !!localRooms[0]

      if(!hasValidRooms) {
        await createChat()
        setReload(reload + 1)
      }

    } catch (e) {
      setHasErrors(true)
    }

  }

  const retrieveRooms = async () => {

    try {

      const localRooms = await getChats()
      const hasValidRooms = !!localRooms[0]

      if(!hasValidRooms) {
        return
      }

      const isRoomIdEmpty = parseInt(currentRoom.id) <= 0
      const isRoomIdValid = !isRoomIdEmpty ? localRooms.some((room : TCurrentRoom) => room.id.trim() == currentRoom.id.trim()) : false

      if (isRoomIdEmpty || !isRoomIdValid) {        
        setCurrentRoom({
          id : localRooms[0].id,
          selectId : 0, 
          name : localRooms[0].name
        })
      }

      setRooms(localRooms)

    } catch (e) {      
      setHasErrors(true)
    }
    
  }

  const retrieveMessages = async () => {      
    
      try {

        const authInfo = await authStatus({})
        const rawMessages = await getMessages()
        const filteredMessages = rawMessages.filter((m : TMessage) => m.chatId == currentRoom.id)
        const uniqueIdList = new Set<string>()
        const userNameList : string[] = []
    
        const convertedMessages = filteredMessages.map((m : TMessage) => {

          if(!uniqueIdList.has(m.senderId)) {
            uniqueIdList.add(m.senderId)
            userNameList.push(m.senderName)
          }

          return {
            id : m.id,
            user: m.senderId == authInfo.id ? currentUser.name : m.senderName,
            content: m.content,
            created_at: convertDatetimeToMilliseconds(m.created_at),
            updated_at: convertDatetimeToMilliseconds(m.updated_at),
            room: m.chatId,
          }

        })
            
        const sortedMessages = sortByMilliseconds(convertedMessages)

        setRoomUsers(userNameList)
        setMessages(sortedMessages)        

      } catch (e) {
        setHasErrors(true)
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
    
    const dateTimeNow = Date.now()    
    
    try {

      const newMessage : TChatMessage = {        
        user : currentUser?.name ? currentUser.name : '',
        content : message.content,
        created_at : dateTimeNow,
        updated_at : dateTimeNow,
        room : currentRoom.id,
      }
  
      if(newMessage.content.trim() == '') { // Out of place validation.
        notifyUser('Write something first!')
        return
      }
  
      const userInfo = await authStatus({})

      if (!userInfo.authenticated) {              
        notifyUser('Not Allowed!', 'error')        
        resetMessageContent()
        return
      }

      await addUserToChat(userInfo.id, currentRoom.id) // Adding user to chat without checking.
  
      const savedMessageId = await createMessage(
        userInfo.id,
        currentRoom.id,
        newMessage.content,    
        newMessage.user
      ) as string

      const savedMessage = {
        id : savedMessageId, 
        ...newMessage
      }      

      socket?.connect()

      socket?.emit('room', savedMessage)   
      addMessage(savedMessage)
      resetMessageContent()

    } catch (e) {
      setHasErrors(true)
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

      await createChat()

      delay == 0 ? notifyUser(creationMessage, 'success') : 
      socket?.emit('change', creationMessage)
      setReload(reload + 1)

    } catch (e) {
      setHasErrors(true)
    }

  }

  const deleteAllRooms = async () => {       

    try {      
      const deletionMessage = `All rooms deleted, a fresh one was created`
      await deleteAllChats()
      socket?.emit('change', deletionMessage)          
      setReload(reload + 1)
    } catch (e) {
      setHasErrors(true)
    }

    setDelay(5000)

  }

  const onSelectChange = (e : React.ChangeEvent<HTMLSelectElement>) => {    
    const selectId = e.target.selectedIndex
    const roomId = e.target[selectId].id 
    const roomName = e.target.value    
    setCurrentRoom({id : roomId, selectId : selectId, name : roomName})
    setReload(reload + 1)
  }

  const onTextareaChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage((rest : TChatMessage) => ({
      ...rest,      
      content : e.target.value,     
    }))        
  }

  const onResetRoomsClick = async () => {         

    if(!delay) {
      
      const userInfo = await authStatus({})
  
      if (!userInfo.authenticated || userInfo.role != 'Admin') {        
        notifyUser('Not Allowed!', 'error')
        return
      }

      setCurrentRoom({ id: '-1', selectId: 0, name : ''})

      await deleteAllRooms()   

      setDelay(5000)

    } else {
      notifyUser(`Please Wait a Moment`,`warning`)
    }

  }
  
  const onNewRoomClick = async () => {
    if(!delay) {
      await createRoom()
      setDelay(5000)
    } else {
      notifyUser(`Please Wait a Moment`,`warning`)      
    }
  }

  const initialSetup = async () => {        
    await retrieveCurrentUser()
    await createRoomIfNoneAreFound()
    await retrieveRooms()
    await retrieveMessages()
    resetMessageContent()
  }

  useEffect(() => {     
    
    const timer = setTimeout(() => {      
      setDelay(0)
    }, delay)

    if(hasErrors) {      
      notifyUser(`Something Went Wrong, please try again later`, `warning`)
      setHasErrors(false)
    }

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

     socket?.on('change', (msg : string) => {
      if(msg) {                
        notifyUser(msg, 'info')
        setReload(reload + 1)
      }
     })     

     return () => {        
              
        socket?.disconnect()
        socket?.off()
        
        if (isCurrentRoomIdValid) {
          setReload(reload + 1)
        } else {
          setReload(0)
        }

        clearTimeout(timer)
        scrollToLatest()

     }

  }, [rooms.length, messages.length, currentRoom.id, reload, auth])
  
  const onEnterMessageEditMode = async (e : React.MouseEvent<HTMLSpanElement, MouseEvent>) => {

    const selectedMessage = e.target as HTMLSpanElement         
    const selectedMessageId = selectedMessage.dataset.id
    const previousMessagge = selectedMessage.textContent ? selectedMessage.textContent : ''

    setMessageBeingEdited({
      ...messageBeingEdited, 
      id : selectedMessageId,
      previous : previousMessagge
    })

  }

  const onExitMessageEditMode = async () => {
    setReload(reload + 1)
    setMessageBeingEdited({...messagePlaceholder, previous : ''})
  }

  const onInputEditableMessage = async (e : React.FormEvent<HTMLSpanElement>) => {    
    const element = e.target as HTMLSpanElement
    const msg = element?.textContent ? element.textContent : ''
    setMessageBeingEdited({...messageBeingEdited, content : msg})
  }

  const onClickEditModeIcon = async (e : React.MouseEvent<HTMLHeadingElement, MouseEvent>) => {

    const element = e.target as HTMLHeadingElement
    const action = element.dataset.action

    switch(action) {

      case 'edit' : {        
        const selectedMessage = messageContainerRef.current as HTMLSpanElement         
        const selectedMessageId = selectedMessage.dataset.id
        setMessageBeingEdited({
          ...messageBeingEdited, 
          id : selectedMessageId
        })                  
        messageContainerRef.current?.focus()
        break
      }

      case 'delete' : {
        messageBeingEdited.id ? await deleteMessage(messageBeingEdited.id) : ''
        onExitMessageEditMode()
        socket?.emit('change', 'A message was deleted')
        break
      }

      case 'confirm' : {                        
          messageContainerRef.current ? messageContainerRef.current.textContent = messageBeingEdited.content : ''
          messageBeingEdited.id ? await updateMessage(messageBeingEdited.id, messageBeingEdited.content) : ''
          onExitMessageEditMode()        
          notifyUser(e)
          socket?.emit('change', 'A message was edited')
        break
      }   

      case 'cancel' : {
        if (messageBeingEdited.previous) {
          messageContainerRef.current ? messageContainerRef.current.textContent = messageBeingEdited.previous : ''
        }
        onExitMessageEditMode()        
        break
      }

      default :
      break
      
    }
    
  }  

  return (
    
    <section className={`flex flex-col bg-transparent justify-center items-center text-center`}>          

      <section className={`flex flex-col justify-center items-center text-center gap-3`}>  

        <div className={`flex justify-between ${primaryDefault} rounded-lg w-80`}>

          <h3 className='bg-transparent justify-start m-2'>
            {(auth && currentUser?.name) ? `Chatting as ${currentUser.name} ` : `Chatting as Guest`}              
          </h3>
        
          <span className='flex bg-tranparent m-2 cursor-pointer mx-4 gap-2'>

            <button title={`Room info`} onClick={() => notifyUser(`Messages : ${messages.length}, Users : ${roomUsers.length}`)}>
              {/* <FontAwesomeIcon icon={faBars}/> */}
               {/* <FontAwesomeIcon icon={faComment}/> */}
              <FontAwesomeIcon icon={faCircleInfo}/>
            </button>
            
            <button title={`Toggle Hide/Show Chat`} onClick={() => setChatHidden(!chatHidden)}>
              {chatHidden ? <FontAwesomeIcon icon={faEyeSlash}/> : <FontAwesomeIcon icon={faEye}/>}
            </button>
            
          </span>

        </div>

        <div className={`flex flex-col gap-1 ${secondaryDefault} rounded-lg w-80 h-80 overflow-y-scroll ${chatHidden ? 'hidden' : ''}`} ref={chatContainerRef}> 

          { messages?.map((message, id) => { 

            const isUserSender = currentUser.name == message.user
            const isMessageSelected = message.id == messageBeingEdited.id
            const isMessageFocused = document.activeElement == messageContainerRef.current                      
            
            return (

              <Fragment key={`msg-${id}`}>

                <span className={`${isUserSender ? 'self-end' : 'self-start'} mx-3 p-2 justify-end bg-transparent`}>
                  <h4 className='bg-transparent text'>{isUserSender ? 'You' : message.user}</h4>
                </span>
                            
                <span 

                  data-id={message.id}
                  ref={messageBeingEdited.id == message.id ? messageContainerRef : null}
                  className={`${isUserSender ? 'self-end' : 'self-start'} mx-3 p-2 ${primaryDefault} rounded max-w-48 h-fit break-words cursor-pointer`}
                  contentEditable={isUserSender && isMessageSelected}

                  onClick={(e) => onEnterMessageEditMode(e)}
                  onInput={(e) => onInputEditableMessage(e)}

                  onBlur={() => {                  
                    if (!messageBeingEdited.content) {
                      messageContainerRef.current ? messageContainerRef.current.textContent = message.content : ''
                      onExitMessageEditMode()
                    }
                  }}

                > 

                  <h5 key={`msg-content-${id}`} className='bg-transparent' data-id={message.id}>
                    {message.content}            
                  </h5>

                </span>
              
                <span className={`flex items-end justify-end cursor-pointer mx-3 px-1 gap-1 ${(isUserSender && isMessageSelected) ? '' : 'hidden'}`}>
                  { !isMessageFocused && !messageBeingEdited.content ? <h3 data-action={`edit`} title={`Edit`} onClick={(e) => onClickEditModeIcon(e)}>&#128393;</h3> : ''}
                  { isMessageFocused ? <h3 data-action={`confirm`} title={`Confirm`} onClick={(e) => onClickEditModeIcon(e)}>&#10003;</h3> : ''}
                  { !isMessageFocused && !messageBeingEdited.content ? <h3 data-action={`delete`} title={`Delete`} onClick={(e) => onClickEditModeIcon(e)}>&#128465;</h3> : ''}
                  <h3 data-action={`cancel`} title={`Cancel`}  onClick={(e) => onClickEditModeIcon(e)}>&#10005;</h3>
                </span>

                <span className={`${isUserSender ? 'self-end' : 'self-start'} mx-2 p-1 justify-end bg-transparent`}>
                  <h5 key={`msg-created_at-${id}`}  className='bg-transparent text-sm'>
                    <time>{`${getTime(message.created_at)}`}</time>
                    <time className={`text-slate-300 italic`}>{message.created_at != message.updated_at ? ` 📝(${getTime(message.updated_at)})` : ``}</time>
                  </h5>
                </span>
              
              </Fragment>

            )

          })}      
            
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
            value={'Send'}
            className='p-2 bg-[#aa5a95] text-white rounded-lg m-1'
            disabled={!!reload}
            onClick={() => sendMessage()}
          />

        </div>            
      
      </section> 

      <section className='flex flex-col mt-2'>

        {
          (rooms[0]?.id !== '-1') ?
          <CustomSelect
            name='Current Chat Room'
            onChange={(e) => onSelectChange(e)}
            className={`bg-slate-900 w-80 text-center`}
            title={`Messages : ${messages.length}, Users : ${roomUsers.length}`}
            value={currentRoom.name}
            values={
              rooms.map((room) => {
                return {
                  id : room.id, 
                  name : room.name
                }
              })} 
            /> : 
          <CustomSelect
            name='Current Chat Room'
            className={`bg-slate-900 w-80`}
            values={[{name : '...'}]}
          />
        }

      </section>

      <section className={`flex justify-between w-80`}>

        <CustomButton 
          value={'New Room'}
          variationName='varthree'
          className={`w-full h-12 flex items-center justify-center`}
          disabled={!!reload}
          onClick={() => onNewRoomClick()}
        />

        <CustomButton 
          value={'Reset Rooms'}
          variationName='vartwo'
          className={`w-full h-12 flex items-center justify-center`}
          disabled={!!reload}
          onClick={() => onResetRoomsClick()}
        />

        <CustomButton
          value={`🐜`}
          variationName='varthree'
          className={`bg-green-700 w-full h-12 flex items-center justify-center`}
          disabled={!!reload}
          onClick={() => notifyUser(`If the chat happens to go blank, please refresh the page.`)}
        />

      </section>      

    </section>    

    
  )
  
}


export default Chat
import { useContext, useEffect, useRef, useState, Fragment } from 'react'
import { addUserToChat, authStatus, createChat, createMessage, deleteAllChats, deleteMessage, getChatById, getChats, getMessages, getUserById, updateMessage, } from '../../hooks/useAxios'
import { TUser, TMessage, TChatMessage, TChatRoom, TRes } from '../../utils/types'
import { userPlaceholder, messagePlaceholder } from '../../utils/placeholders'
import { convertDatetimeToMilliseconds, cropMessage, getTime, sortByAlphabeticalOrder, sortByMilliseconds } from '../../utils/useful-functions'
import { authContext } from '../../utils/contexts/auth-provider'
import { socketContext } from '../../utils/contexts/socket-provider'
import { toastContext } from '../../utils/contexts/toast-provider'
import { primaryDefault, secondaryDefault } from '../../utils/tailwindVariations'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faCircleInfo, faClipboard, faClipboardCheck } from '@fortawesome/free-solid-svg-icons'

import CustomSelect from '../atoms/select'
import CustomButton from '../atoms/button'

const roomsPlaceholder = [{id : '-1', name : ''}]
const currentRoomPlaceHolder = {id : '-1', selectId : 0, name : ''}

type TCurrentRoom = {id : string, selectId : number, name : string}
type TRooms = {id : string, name : string}[]

const Chat = () => {
  
  let chatContainerRef = useRef<HTMLDivElement>(null)
  let chatRoomContainerRef =  useRef<HTMLSelectElement>(null)  
  let messageContainerRef =  useRef<HTMLSpanElement>(null)  
  let confirmContainerRef =  useRef<HTMLButtonElement>(null)

  const [rooms, setRooms] = useState<TRooms>(roomsPlaceholder)
  const [currentUser, setCurrentUser] = useState<TUser>(userPlaceholder)
  const [currentRoom, setCurrentRoom] = useState<TCurrentRoom>(currentRoomPlaceHolder)
  const [roomUsers, setRoomUsers] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [inactiveUsers, setInactiveUsers] = useState<string[]>([])
  const [message, setMessage] = useState<TChatMessage>(messagePlaceholder)
  const [messages, setMessages] = useState<TChatMessage[]>([])
  const [messageBeingEdited, setMessageBeingEdited] = useState<TChatMessage & {previous ? : string}>(messagePlaceholder)
  const [hasErrors, setHasErrors] = useState(false)
  const [showNotifications, setShowNotifications] = useState(true)
  const [firstLoad, setFirstLoad] = useState(true)
  const [reload, setReload] = useState(1)
  const [cooldown, setCooldown] = useState(0)
  const [useDelayOnEmit, setUseDelayOnEmit] = useState(false)
  const [verticalView, setVerticalView] = useState(false)
  const [renderCounter, setRenderCounter] = useState(0)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [userActivity, setUserActivity] = useState(true)
  const [inactivityTimerId, setInactivityTimerId] = useState<NodeJS.Timeout | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  const isCurrentRoomIdValid = currentRoom.id == '0' || currentRoom.id == '-1'

  const socket = useContext(socketContext)
  const {notifyUser} = useContext(toastContext)
  const {auth, setAuth, role} = useContext(authContext)

  const scrollToLatest = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const retrieveCurrentUser = async () => {

    console.log(`FUNCTION : Retrieving current user.`)

    try {      

      const authInfo : TRes = await authStatus({})
      const user = await getUserById(authInfo.id)      
  
      setCurrentUser({
        name : user.name,
        username : user.username,
        email : user.email,
        role : authInfo.role,
      })

      if(firstLoad) {
        setInactivityTimer(user.name)
      }

    } catch(e) {
      setHasErrors(true)
    }

  }

  const createRoomIfNoneAreFound = async () => {      
    
    console.log(`FUNCTION : Creating room if none are found.`)

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

    console.log(`FUNCTION : Retrieving rooms.`)

    try {
      
      const unsortedLocalRooms = await getChats() as TChatRoom[]
      const sortedLocalRooms = sortByAlphabeticalOrder(unsortedLocalRooms)
      const hasValidRooms = !!sortedLocalRooms[0]

      if(!hasValidRooms) {
        return
      }

      const isRoomIdEmpty = parseInt(currentRoom.id) <= 0
      const isRoomIdValid = !isRoomIdEmpty ? sortedLocalRooms.some((room : TChatRoom) => room.id.trim() == currentRoom.id.trim()) : false
      const isNumberOfRoomsTheSame = unsortedLocalRooms.length == rooms.length

      if (isRoomIdEmpty || !isRoomIdValid) {
        setCurrentRoom({
          id : sortedLocalRooms[0].id,
          selectId : 0,
          name : sortedLocalRooms[0].name
        })
      } else if (!isNumberOfRoomsTheSame!) {        
        const updatedSelectId = sortedLocalRooms.findIndex((room) => room.id.trim() == currentRoom.id.trim())      
        setCurrentRoom({
          id : sortedLocalRooms[updatedSelectId].id,
          selectId : updatedSelectId, 
          name : sortedLocalRooms[updatedSelectId].name
        })                
        setReload(reload + 1)
      }

      setRooms(sortedLocalRooms)

    } catch (e) {      
      setHasErrors(true)
    }
    
  }

  const retrieveMessages = async () => {  
    
    console.log(`FUNCTION : Retrieving messages.`)
    
      try {

        if(currentRoom.id == '-1') {          
          setReload(reload + 1)
          return
        }

        const authInfo = await authStatus({})
        const rawMessages = await getMessages() // Getting all messages to filter them based on room, change this later.
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

      if(socket?.disconnected) {        
        socket?.connect()
      }

      const delay = useDelayOnEmit ? 500 : 0 // Prevents the socket from being disconnected too early.

      setTimeout(() => {
        socket?.emit(`room`, savedMessage, (response : boolean) => {
          if (response) {
            console.log(`Message Sent Successfully : ${response}`)          
          } else {
            console.log(`Failed to Send the Message`)
            setHasErrors(true)
          }
        })
      }, delay)

      console.log(`Sending message : ${JSON.stringify(savedMessage)}, socket connection : ${socket?.connected}`)

      addMessage(savedMessage)
      resetMessageContent()
      setUseDelayOnEmit(false)
          
      const isUserOnList = roomUsers.find((name) => name == currentUser.name) // Short List
      currentUser?.name && !isUserOnList ? setRoomUsers([...roomUsers, currentUser.name]) : ''
      
    } catch (e) {
      setHasErrors(true)
      setUseDelayOnEmit(false)
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

      notifyUser(creationMessage, 'success')

      if(socket?.disconnected) {
	      socket?.connect()
      }

      socket?.emit(`change`, creationMessage)
      console.log(`Creating chat, socket connection : ${socket?.connected}`)

      setReload(reload + 1)

    } catch (e) {
      setHasErrors(true)
    }

  }

  const notifyMessageInRoom = async (id : string) => {
    try {
      const selectedRoom = await getChatById(id)      
      notifyUser(`New message in ${selectedRoom.name}`)
    } catch (e) {
      setHasErrors(true)    
    }
  }

  const deleteAllRooms = async () => {

    try {      

      if(socket?.disconnected) {
        socket?.connect()
      }

      setTimeout(() => {
        socket?.emit(`change`, `All rooms deleted, a fresh one was created`)
      }, 200)

      console.log(`Deleting Rooms, socket connection : ${socket?.connected}`)
      
      await deleteAllChats()
      await retrieveRooms()
                  
      setReload(reload + 1)
      setUseDelayOnEmit(true)

    } catch (e) {
      setHasErrors(true)
    }

  }

  const copyRoomNameToClipboard = () => {
    const roomName = currentRoom.name.trim().replace(/\s+/g, ' ')
    navigator.clipboard.writeText(roomName)
    setCopiedToClipboard(true)
    setTimeout(() => {
      setCopiedToClipboard(false)
    }, 3000)
  }

  const onSelectChange = (e : React.ChangeEvent<HTMLSelectElement>) => {    
    const selectId = e.target.selectedIndex
    const roomId = e.target[selectId].id
    const roomName = e.target[selectId].textContent
    setCurrentRoom({id : roomId, selectId : selectId, name : roomName ? roomName : 'Unknown Room'})
    setReload(reload + 1)
  }

  const onTextareaChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage((rest : TChatMessage) => ({
      ...rest,      
      content : e.target.value,     
    }))        
  }

  const onResetRoomsClick = async () => {

    if(!cooldown) {
      
      const userInfo = await authStatus({})
  
      if (!userInfo.authenticated || userInfo.role != 'Admin') {
        notifyUser('Not Allowed!', 'error')
        return
      }

      setCurrentRoom({ id: '-1', selectId: 0, name : ''})

      await deleteAllRooms()

      setCooldown(5000)

    } else {
      notifyUser(`Please Wait a Moment`,`warning`)
    }

  }
  
  const onNewRoomClick = async () => {
    if(!cooldown) {
      await createRoom()
      setCooldown(5000)
    } else {
      notifyUser(`Please Wait a Moment`,`warning`)
    }
  }

  const initializeAppData = async () => {     
    await retrieveCurrentUser()
    await createRoomIfNoneAreFound()
    await retrieveRooms()
    await retrieveMessages()    
    resetMessageContent()
  }

  useEffect(() => {

    setRenderCounter(renderCounter + 1)
    
    console.log(` - Running useEffect.`)
    
    const timer = setTimeout(() => {
      setCooldown(0)
    }, cooldown)

    if(copiedToClipboard) {
      setCopiedToClipboard(false)
    }

    if(hasErrors) {
      notifyUser(`Something Went Wrong, please try again later`, `warning`)
      setHasErrors(false)
    }

    if(reload > 0) {
      initializeAppData()
    }

    if(socket?.disconnected) {
      socket?.connect()
    }

    socket?.emit(`authList`)
    socket?.emit(`inactiveList`)

    socket?.on('room', (msg : TChatMessage) => {

      console.log(`socket on room : ${currentRoom?.id}`)

      const {id, room} = msg
      const previousMessageId = messages?.length > 0 ? messages[0].id : -1
      
      if (room == currentRoom.id) {
        if (id != previousMessageId) {
          addMessage(msg)
        }
      } else {
        if(showNotifications) {
          notifyMessageInRoom(room)
        }
      }

      if(id != previousMessageId) {
        setReload(reload + 1)
      }      

    })
    
    socket?.on('messageChange', (msg : string) => {
      console.log(`socket on messageChange : ${currentRoom?.id}`)
      if(msg) {
        if(showNotifications) {
          notifyUser(msg, 'info')
        }
        setReload(reload + 1)
      }
    })

    socket?.on('change', (msg : string) => {
      console.log(`socket on change : ${currentRoom?.id}`)
      setUseDelayOnEmit(true)
      setReload(reload + 1)
      if (msg != ``) {
        notifyUser(msg, 'info')
      }
    })    

    socket?.on(`auth`, (currentOnlineUsers : string[]) => {
      console.log(`socket on auth : ${currentRoom?.id}`)
      setOnlineUsers(currentOnlineUsers)
    })

    socket?.on(`inactive`, (currentInactiveUsers : string[]) => {
      console.log(`socket on auth : ${currentRoom?.id}`)
      setInactiveUsers(currentInactiveUsers)
    })

    return () => {
               
      if (isCurrentRoomIdValid) {
        setReload(reload + 1)
      } else {        
        setReload(0)
      }       

      setMessageBeingEdited({...messagePlaceholder, previous : ''})
      clearTimeout(timer)

      if(!firstLoad) {        
        socket?.off()
        socket?.disconnect()
      } else {        
        setFirstLoad(false)
      }      

    }
  
  }, [rooms.length, messages.length, currentRoom.id, reload, auth, showNotifications])

  useEffect(() => {
    scrollToLatest()
  }, [messages.length])
  
  useEffect(() => {

    console.log(`Running "handle before unload" useEffect.`)

    if (currentUser.name != ``) {   
         
        const handleBeforeUnload = () => {
          socket?.connect()
          socket?.emit('inactive', {name : currentUser.name, inactive : true})
        }

        window.addEventListener('beforeunload', handleBeforeUnload)      

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        socket?.off()
        socket?.disconnect()
      }

    }

  }, [currentUser.name])
  
  useEffect(() => { 
    if(!firstLoad) { // First load handled by retrieveCurrentUser
      setInactivityTimer()
    }
  }, [userActivity])

  const setInactivityTimer = (localUserName = null) => {
    if (userActivity) {
      //notifyUser(`Scheduled Inactivity Activation.`)
      const name = localUserName ? localUserName : currentUser.name          
      const timerId = setTimeout(() => {
        setUserActivity(false)
        socket?.connect()
        socket?.emit('inactive', { name: name, inactive: true })
      }, 60000) // Time until inactivity      
      setInactivityTimerId(timerId)
    }
  }

  const handleUserActivity = () => {
    if (!userActivity) {
      //notifyUser(`Renewed Activity Status`)
      setUserActivity(true)
      socket?.connect()
      socket?.emit('inactive', { name: currentUser.name, inactive: false })
      inactivityTimerId ? clearTimeout(inactivityTimerId) : ''
    }
  }

  const onEnterMessageEditMode = async (e : React.MouseEvent<HTMLSpanElement, MouseEvent>) => {    

    const selectedMessage = e.target as HTMLSpanElement
    const selectedMessageId = selectedMessage.dataset.id
    const previousMessage = selectedMessage.textContent ? selectedMessage.textContent : ''
      
    setMessageBeingEdited({
      ...messageBeingEdited,
      id : selectedMessageId,
      previous : previousMessage
    })

  }

  const onInputEditableMessage = async (e : React.FormEvent<HTMLSpanElement>) => {
    
    const element = e.target as HTMLSpanElement
    const msg = element?.textContent ? element.textContent : ''
    setMessageBeingEdited({...messageBeingEdited, content : msg})
  }

  const onClickEditModeIcon = async (e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    const element = e.target as HTMLButtonElement
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
        const editedMessage = messageBeingEdited?.previous ?  messageBeingEdited.previous : ''
        socket?.emit('messageChange', `The message "${cropMessage(editedMessage)}" was deleted on ${currentRoom.name}`)
        setMessageBeingEdited({...messagePlaceholder, previous : ''})
        setReload(reload + 1)
        break
      }

      case 'confirm' : {
        messageContainerRef.current ? messageContainerRef.current.textContent = messageBeingEdited.content : ''
        messageBeingEdited.id ? await updateMessage(messageBeingEdited.id, messageBeingEdited.content) : ''
        const previousMessage = messageBeingEdited?.previous ? cropMessage(messageBeingEdited.previous, 20) : '...'
        const updatedMessage = messageBeingEdited?.content ? cropMessage(messageBeingEdited.content, 20) : '...'
        socket?.emit('messageChange', `Message updated from "${previousMessage}" to "${updatedMessage}" on ${currentRoom.name}`)
        setMessageBeingEdited({...messagePlaceholder, previous : ''})
        setReload(reload + 1)
        break
      }

      case 'cancel' : {
        if (messageBeingEdited?.previous) {
          messageContainerRef.current ? messageContainerRef.current.textContent = messageBeingEdited.previous : ''
          setMessageBeingEdited({...messagePlaceholder, previous : ''})
        }
        break
      }

      default :
      break
      
    }
    
  }

  const mainSectionStyle = verticalView ? 
  `flex flex-col justify-center items-center text-center` : 
  `flex justify-center items-center text-center`

  const usersOnlineSection = verticalView ? 
  `flex hidden` : 
  `flex flex-col mb-auto w-1/3 justify-end items-end text-end gap-3`

  const chatSectionStyle = verticalView ? 
  `flex flex-col justify-center items-center text-center gap-3`   : 
  `flex flex-col w-fit justify-center items-center text-center gap-3`

  const buttonSectionStyle = verticalView ? 
  `flex justify-between w-80` : 
  `flex flex-col mb-auto w-1/3 justify-start items-start text-start`

  const buttonDivStyle = verticalView ? 
  `flex justify-between w-80 gap-3 my-2` : 
  `flex flex-col justify-start h-80 gap-3 mx-2`  

  return (    

    <section 
      className={mainSectionStyle} 
      onMouseDown={() => handleUserActivity()}
      onKeyDown={() => {
        handleUserActivity()
        if(!isTyping) {          
          setIsTyping(true)
        }
      }}
      onKeyUp={() => {
        if(isTyping) {          
          setTimeout(() => {
            setIsTyping(false)
          }, 1000)
        }
      }}            
    >

      <section className={usersOnlineSection}>

        <div className={`flex ${verticalView ? `justify-start gap-2 rounded-lg w-80` : `justify-center gap-1 flex-col mx-2 min-w-28 max-w-28`} bg-slate-900 rounded-lg p-2 text-center items-center items select-none`}>
          <h3 className={`bg-white text-black rounded p-1 w-full`}>Room Users</h3>
          <span className={`bg-transparent m-1 rounded-lg ${roomUsers.length >= 10 ? `overflow-y-scroll` : ``} w-full min-h-[20px] max-h-[312px]`}>
            {              
              roomUsers.length > 0 ? 
                roomUsers.map((user, id) => {

                  const isCurrentUserName = currentUser.name == user
                  const inactiveUserId = inactiveUsers.findIndex((inactiveUser) => inactiveUser == user)
                  const isUserInactive = inactiveUserId > -1

                  const isUserOnline = onlineUsers.find((onlineUser) => {
                    if (onlineUser == user) {
                      return onlineUser
                    }
                  })       

                  return <p 
                    title={isUserOnline ? `${user} is online.` : `${user} is offline.`} 
                    className={
                      `${isUserOnline ? (
                          isCurrentUserName ? (!userActivity ? `text-orange-400` : `text-green-400`) : (isUserInactive ? `text-orange-400` : `text-green-400`)
                        ) : `text-gray-300`}`
                    }                    
                    key={`roomUser-${id}`}>{cropMessage(user, 8)}
                  </p>

                }) : 
              <p className={`text-gray-400`}>...</p>
            }
          </span>
        </div>

      </section>

      <section className={chatSectionStyle}>

        <div className={`flex justify-between ${primaryDefault} rounded-lg w-80`}>          

          <h3 className='bg-transparent justify-start m-2'>
            {
            // 🔘 🔴 🟠 🟡 🟢 🔵 🟣 ⚫️ ⚪️ 🟤
            (auth && currentUser?.name) ? 
              `${userActivity ? `🟢` : `🟠`} Chatting as ${cropMessage(currentUser.name, 12)} ` : 
              `🔴 Chatting as Guest`
            }
          </h3>
        
          <span className='flex bg-tranparent m-2 cursor-pointer gap-1'>

            <button 
              title={`Room info`} 
              disabled={!!reload || firstLoad}
              onClick={() => notifyUser(`Messages : ${messages.length}, Users : ${roomUsers.length}`)} 
              className='bg-[#050D20] hover:bg-black rounded-lg disabled:cursor-not-allowed'>
              <FontAwesomeIcon icon={faCircleInfo} width={48} height={48}/>
            </button>
            
            <button 
                title={`Toggle hide/show message notifications from other chats`} 
                disabled={!!reload || firstLoad}
                onClick={() => setShowNotifications(!showNotifications)} 
                className='bg-[#050D20] hover:bg-black rounded-lg disabled:cursor-not-allowed'>
                {!showNotifications ? 
                <FontAwesomeIcon icon={faEyeSlash} width={48} height={48}/> : 
                <FontAwesomeIcon icon={faEye} width={48} height={48}/>}
            </button>
            
          </span>

        </div>

        <div className={`flex flex-col gap-1 ${secondaryDefault} rounded-lg w-80 h-80 overflow-y-scroll`} ref={chatContainerRef}> 

          {messages?.map((message, id) => {

            const isUserSender = currentUser.name == message.user
            const isMessageSelected = message.id == messageBeingEdited.id
            const isMessageFocused = document.activeElement == messageContainerRef.current

            // 🥗 🌮 🍣 🍙 🍘 🍥 🍨 ☕️ 🎂 🥡 🍵 🍢🍡
            
            return (

              <Fragment key={`message-fragment-${id}`}>

                <span className={`${isUserSender ? 'self-end' : 'self-start'} mx-3 py-2 justify-end bg-transparent`}>
                  <h4 className={`bg-transparent font-semibold ${isUserSender ? 'text-yellow-500' : ''}`}>{isUserSender ? `🍣 You` : `🥡 ${message.user}`}</h4>
                </span>
                            
                <span // Editable component with `children` managed by React.
                  
                  data-id={message.id}
                  ref={isMessageSelected ? messageContainerRef : null}
                  className={`${isUserSender ? 'self-end' : 'self-start'} mx-3 p-2 ${primaryDefault} rounded max-w-48 h-fit break-words cursor-pointer`}
                  suppressContentEditableWarning={true}
                  contentEditable={isUserSender && isMessageSelected}

                  onClick={(e) => {                     
                    if (isUserSender) {
                      if (!messageBeingEdited.content) {
                        onEnterMessageEditMode(e)
                      }
                    } else {
                      notifyUser(
                        `Message wrote by ${message.user}, it was created ${getTime(message.updated_at)} ${message.updated_at == message.created_at ? `` : `and updated at ${getTime(message.updated_at)}`}`
                      )
                    }
                  }}

                  onInput={(e) => {
                    onInputEditableMessage(e)
                  }}

                  onBlur={(event) => {                    
                    if (confirmContainerRef.current && event.relatedTarget != confirmContainerRef.current) {
                      messageContainerRef.current ? messageContainerRef.current.textContent = message.content : ''
                      setMessageBeingEdited({...messagePlaceholder, previous : ''})
                      setReload(reload + 1)
                    }                    
                  }}

                >                  
                  
                  {message.content}

                </span>
              
                <span className={`flex items-end justify-end cursor-pointer mx-3 px-1 gap-1 ${(isUserSender && isMessageSelected) ? '' : 'hidden'}`}>
                  
                  { !isMessageFocused && !messageBeingEdited.content ? <button                      
                    className='hover:bg-slate-600 rounded-full' 
                    data-action={`edit`} 
                    title={`Edit`} 
                    onClick={(e) => onClickEditModeIcon(e)}>
                      &#128393;
                  </button> : ''}
                  
                  { isMessageFocused ? <button
                    name={`confirm`} 
                    ref={confirmContainerRef}
                    className='hover:bg-slate-600 rounded-full' 
                    data-action={`confirm`} 
                    title={`Confirm`} 
                    onClick={(e) => onClickEditModeIcon(e)}>
                      &#10003;
                  </button> : ''}
                  
                  { !isMessageFocused && !messageBeingEdited.content ? <button 
                    className='hover:bg-slate-600 rounded-full' 
                    data-action={`delete`} 
                    title={`Delete`} 
                    onClick={(e) => onClickEditModeIcon(e)}>
                      &#128465;
                  </button> : ''}
                  
                  <button 
                    className='hover:bg-slate-600 rounded-full' 
                    data-action={`cancel`} 
                    title={`Cancel`}  
                    onClick={(e) => onClickEditModeIcon(e)}>
                      &#10005;
                  </button>

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
            maxLength={255}
            onChange={(e) => {onTextareaChange(e)}}
            placeholder={`Say something...`}
            value={message.content}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (e.ctrlKey || e.metaKey) {
                  sendMessage()
                }
              }
            }}
          />

          <CustomButton        
            value={
              <span className={`flex flex-col gap-1`}>
                <h3 className='text-slate-100 group-hover:text-white'>
                  Send
                </h3>
                <h3 className={`font-light text-sm text-slate-200 group-hover:text-slate-100`}>
                  Ctrl+Enter
                </h3>
              </span>
            }
            className='p-2 bg-[#aa5a95] text-white rounded-lg m-1 active:bg-[#bd64a5] group'
            disabled={!!reload || firstLoad}
            onClick={() => sendMessage()}
            title={`Post a message to current chat (Ctrl + Enter)`}
          />

        </div> 

        <div className={`flex flex-col items-center justify-center select-none gap-3`}>

          <label htmlFor={`current-chat-room`} className="bg-transparent">
            Current Chat Room
          </label>

          <span className={`flex items-center justify-center select-none w-80 h-[48px]`}>

            {

              (rooms[0]?.id !== '-1') ? 
              <CustomSelect
                name='current-chat-room'
                createLabel={false}
                ref={chatRoomContainerRef}
                disabled={!!reload || firstLoad}
                onChange={(e) => onSelectChange(e)}
                className={`bg-slate-900 text-center hover:bg-black w-full h-full`}
                title={`Messages : ${messages.length}, Users : ${roomUsers.length}`}
                values={
                  rooms.map((room) => {
                    return {
                      id : room.id,
                      name : room.name
                    }
                  })}
                  value={currentRoom.id}
                /> : 
              <CustomSelect
                name=''
                disabled={!!reload || firstLoad}
                className={`bg-slate-900 text-center hover:bg-black w-full h-full`}
                values={[{name : '...'}]}
              />

            }  

            <button title={`Copy room name to clipboard`} onClick={() => copyRoomNameToClipboard()}
              disabled={!!reload || firstLoad}
                className={`${copiedToClipboard ? `bg-green-700 hover:bg-green-600` : `bg-[#050D20] hover:bg-black`} rounded-lg disabled:cursor-not-allowed h-full w-[48px]`}
              >
              {copiedToClipboard ? 
                <FontAwesomeIcon icon={faClipboardCheck}/> : 
                <FontAwesomeIcon icon={faClipboard}/>
              }
            </button>
            
          </span>       

        </div>              
      
      </section> 

      <section className={buttonSectionStyle}>
                
       <div className={buttonDivStyle}>

          <CustomButton

            value={
              <span className={`flex flex-col gap-1`}>
                <h3 className='text-slate-100 group-hover:text-white'>
                  New Room
                </h3>                
              </span>
            }

            variationName='varthree'
            className={`w-20 h-full max-h-28 m-0 flex items-center justify-center group`}
            disabled={!!reload || firstLoad}
            title={`Create a new room`}
            onClick={() => onNewRoomClick()}

          />
        
          <CustomButton 

            value={
              <span className={`flex flex-col gap-1`}>
                <h3 className='text-slate-100 group-hover:text-white'>
                  Reset Rooms
                </h3>
              </span>
            }

            variationName='vartwo'
            className={`w-20 h-full max-h-28 m-0 flex items-center justify-center group`}
            disabled={!!reload || firstLoad}
            title={`Delete all rooms`}
            onClick={() => onResetRoomsClick()}
          />

          {/* <CustomButton
            value={`Get 🐜`}
            variationName='varthree'
            className={`bg-orange-900 active:bg-orange-800 w-20 h-full max-h-28 m-0 flex items-center justify-center`}
            disabled={!!reload || firstLoad}
            onClick={() => notifyUser(`Button to get a bug.`)}
          /> */}
          
          <CustomButton
            value={`Test 🦾`}
            variationName='varthree'
            className={`bg-black active:bg-gray-900 w-20 h-full max-h-28 m-0 flex items-center justify-center`}
            disabled={!!reload || firstLoad}
            title={`Currently showing nothing.`}
            onClick={ async () => {
              notifyUser(`Button for testing.`)
            }}
          />

       </div>


      </section>      
             
      <div className='flex absolute bg-tranparent top-auto bottom-0 m-8 gap-2'>
        <h3 className={`flex mb-5 bg-purple-600 rounded-lg p-3`}>
          Render : {renderCounter}
        </h3>
        <h3 className={`flex mb-5 bg-cyan-600 rounded-lg p-3`}>
          {isTyping ? `💬` : `〰️`}
        </h3>
        <h3 className={`flex mb-5 bg-orange-600 rounded-lg p-3`}>
          Inactive Users : {inactiveUsers.length}
        </h3>
      </div>
     
    </section>
    
  )
  
}


export default Chat
import { useContext, useEffect, useRef, useState, Fragment } from 'react'
import { addUserToChat, authStatus, createChat, createMessage, deleteAllChats, deleteMessage, getChatById, getChats, getChatsByUserId, getMessageById, getMessages, getUserById, updateMessage, } from '../../hooks/useAxios'
import { TUser, TMessage, TChatMessage, TChatRoom, TRes, TSocketAuthRequest } from '../../utils/types'
import { userPlaceholder, messagePlaceholder } from '../../utils/placeholders'
import { convertDatetimeToMilliseconds, cropMessage, generateUniqueId, getTime, sortByAlphabeticalOrder, sortByMilliseconds } from '../../utils/useful-functions'
import { authContext } from '../../utils/contexts/auth-provider'
import { socketContext } from '../../utils/contexts/socket-provider'
import { toastContext } from '../../utils/contexts/toast-provider'
import { primaryDefault, secondaryDefault } from '../../utils/tailwindVariations'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faEye, faEyeSlash, faCircleInfo, faStop, faPause, faPlay, faAngleDoubleDown,
  faArrowsRotate, faArrowsSpin, faClipboard, faClipboardCheck, faUpDown,
} from '@fortawesome/free-solid-svg-icons'

import CustomSelect from '../atoms/select'
import CustomButton from '../atoms/button'

const roomsPlaceholder = [{id : '-1', name : ''}]
const currentRoomPlaceHolder = {id : '-1', selectId : 0, name : ''}
const editMenuButtonPrefix = `--em-btn--`

const bugsToFix = [
  `When server is out and comes back, the user can't logout due to the token and gets stuck on the chat screen.`,  
  `Editing the message fails sometimes.`,  
  `useEffect rarely stops prematurely, locking the user from interacting with the UI.`,
  `A message is being added to the local chat erroneously for a moment before the chat loads the correct messages.`,
  `Edited status not showing on the other chats when freshly editing a message for the first time.`,
  `previous property on the messageBeingEdited state might not be updating correctly.`,
  `Inactivity status not loading sometimes when refreshing the page.`,
  `Reload not resetting when the data is fetched, locking the user out of the UI.`
]

type TCurrentRoom = {id : string, selectId : number, name : string}
type TRooms = {id : string, name : string}[]
type TMessageBeingEdited = TChatMessage & {previous ? : string, wasEdited : boolean}
type TSocketPayload = Partial<{content : string, notification : string, room : string, notifyRoomOnly : boolean}>

const Chat = () => {

  const [rooms, setRooms] = useState<TRooms>(roomsPlaceholder)
  const [currentRoom, setCurrentRoom] = useState<TCurrentRoom>(currentRoomPlaceHolder)
  const [isUserInRoom, setIsUserInroom] = useState(false)
  const [currentUser, setCurrentUser] = useState<TUser>(userPlaceholder)
  const [roomUsers, setRoomUsers] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]) // Update to use Unique Names
  const [inactiveUsers, setInactiveUsers] = useState<string[]>([])
  const [userActivity, setUserActivity] = useState(true)
  const [message, setMessage] = useState<TChatMessage>(messagePlaceholder)
  const [messages, setMessages] = useState<TChatMessage[]>([])
  const [refreshChat, setRefreshChat] = useState(false)
  const [messageBeingEdited, setMessageBeingEdited] = useState<TMessageBeingEdited>(messagePlaceholder)
  const [showNotifications, setShowNotifications] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const [verticalView, setVerticalView] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [inactivityTimerId, setInactivityTimerId] = useState<NodeJS.Timeout | null>(null)
  const [renderCounter, setRenderCounter] = useState(0)
  const [spam, setSpam] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [useDelayOnEmit, setUseDelayOnEmit] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)
  const [reload, setReload] = useState(1)
  const [hasErrors, setHasErrors] = useState(false)
  const [isServerOnline, setIsServerOnline] = useState(true)
  const [nickname, setNickname] = useState<any>(null)

  let chatContainerRef = useRef<HTMLDivElement>(null)
  let chatRoomContainerRef =  useRef<HTMLSelectElement>(null)
  let messageContainerRef =  useRef<HTMLSpanElement>(null)  
  let handleUserActivityRef = useRef<() => void>(() => {})

  const socket = useContext(socketContext)
  const {notifyUser} = useContext(toastContext)
  const {auth, setAuth, role} = useContext(authContext)

  const scrollToLatest = () => {
    if (autoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const addUserToOnlineList = async (localId : string = '') => {
    const isUserOnList = onlineUsers.find((u) => u == currentUser.name)
    if(!isUserOnList) {      
      const authInfo : TRes = localId == '' ? await authStatus({}) : {id : localId}
      const userInfo = await getUserById(authInfo.id)      
      const authRequest : TSocketAuthRequest = {
        user : {id : authInfo.id, name : userInfo.name},
        isConnecting : true
      }
      socket?.emit(`auth`, authRequest)
      socket?.emit(`authList`)
    } else {
      return
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
      const authInfo : TRes = await authStatus({})   
      const chats : {userId : string, chatId : string}[] = await getChatsByUserId(authInfo.id)   

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
        const foundUserInChat = chats.find((chat) => chat.chatId == sortedLocalRooms[0].id)
        setIsUserInroom(!!foundUserInChat)
      } else if (!isNumberOfRoomsTheSame!) {        
        const updatedSelectId = sortedLocalRooms.findIndex((room) => room.id.trim() == currentRoom.id.trim())      
        setCurrentRoom({
          id : sortedLocalRooms[updatedSelectId].id,
          selectId : updatedSelectId, 
          name : sortedLocalRooms[updatedSelectId].name
        })
        const foundUserInChat = chats.find((chat) => chat.chatId == sortedLocalRooms[updatedSelectId].id)
        setIsUserInroom(!!foundUserInChat)
        setReload(reload + 1)
      }

      setRooms(sortedLocalRooms)

    } catch (e) {      
      setHasErrors(true)
    }
    
  }  

  const convertRawMessage = (m: TMessage, userName : string = ``): TChatMessage => {
    return {
        id: m.id,
        user: userName != `` ? userName : m.senderName,
        content: m.content,
        created_at: convertDatetimeToMilliseconds(m.created_at),
        updated_at: convertDatetimeToMilliseconds(m.updated_at),
        room: m.chatId
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
        //const uniqueNameList = new Set<string>()
        const userNameList : string[] = []        
    
        const convertedMessages = filteredMessages.map((m : TMessage) => {

          if(!uniqueIdList.has(m.senderId)) {
            uniqueIdList.add(m.senderId)
            userNameList.push(m.senderName)
            // if(!uniqueNameList.has(m.senderName)) {
            //   uniqueNameList.add(m.senderName)
            //   userNameList.push(m.senderName)
            // } else {
            //   const uuid = generateUniqueId()
            //   uniqueNameList.add(`${m.senderName} ${uuid}`)
            //   userNameList.push(`${m.senderName} ${uuid}`)
            // }
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

  const sendMessage = async (messageContent = '') => { 
    
    const dateTimeNow = Date.now()
    
    try {      

      const newMessage : TChatMessage = {
        user : currentUser?.name ? currentUser.name : '',
        content : messageContent == '' ? message.content : messageContent,
        created_at : dateTimeNow,
        updated_at : dateTimeNow,
        room : currentRoom.id,
      }
  
      if(newMessage.content.trim() == '') { // Validation out of place.
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
        if(currentUser?.name && !isUserInRoom) {
          const socketPayload : TSocketPayload = {
            notification : `${currentUser.name} has entered `,
            room : currentRoom.id,
            notifyRoomOnly : true
          }
          setRoomUsers([...roomUsers, currentUser.name])
          // const isDuplicate = roomUsers.find((rm) => rm == currentUser.name)
          // if(!isDuplicate) {
          //   setRoomUsers([...roomUsers, currentUser.name])
          // } else {
          //   const uuid = generateUniqueId()
          //   setRoomUsers([...roomUsers, `${currentUser.name} ${uuid}`])
          // }
          setIsUserInroom(true)
          socket?.emit('messageChange', socketPayload)
        }
      }, delay)

      console.log(`Sending message : ${JSON.stringify(savedMessage)}, socket connection : ${socket?.connected}`)

      addMessage(savedMessage)
      resetMessageContent()
      setUseDelayOnEmit(false)

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

  const notifyUserInRoom = async (id : string, roomMessage : string = ``) => {
    try {
      const selectedRoom = await getChatById(id)      
      notifyUser(`${roomMessage != `` ? roomMessage : `New message in `}${selectedRoom.name}`)
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

  const setInactivityTimer =  async (localUserName = null) => {        
    if (userActivity) {
      //notifyUser(`Scheduled Inactivity Activation.`)
      const name = localUserName ? localUserName : currentUser.name
      const timerId = setTimeout(async () => {                        
        //notifyUser(`Going Inactive`)
        setUserActivity(false)
        const authInfo : TRes = await authStatus({})
        socket?.connect()
        socket?.emit(`inactive`, { id : authInfo.id, name: name, inactive: true })
      }, 60000) // Time until inactivity
      setInactivityTimerId(timerId)
    }
  }

  const handleUserActivity = async () => {
    if (!userActivity) {
      //notifyUser(`Renewed Activity Status ${userActivity}`)
      setUserActivity(true)
      const authInfo : TRes = await authStatus({})
      socket?.connect()
      socket?.emit(`inactive`, { id : authInfo.id, name: currentUser.name, inactive: false })
      inactivityTimerId ? clearTimeout(inactivityTimerId) : ''
    }
  }

  useEffect(() => {
    
    if(!isServerOnline) {
      return
    }

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
      const firstMessageId = messages?.length > 0 ? messages[0].id : -1
      
      if (room == currentRoom.id) {
        if (id != firstMessageId) {
          addMessage(msg)
        }
      } else {
        if(showNotifications) {
          notifyUserInRoom(room)
        }
      }

    })
      
    socket?.on('messageChange', (msg : TSocketPayload) => {      
      const {notification, room, notifyRoomOnly} = msg
      console.log(`socket on messageChange : ${room}`)
      if(notification && showNotifications) {
        if(room) {
          if (room == currentRoom.id || !notifyRoomOnly) {
            notifyUserInRoom(room, notification)
          }
        } else {
          notifyUser(notification, `info`)
        }
        setRefreshChat(true)
        //setReload(reload + 1)
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
      setRefreshChat(true)
    })

    socket?.on(`inactive`, (currentInactiveUsers : string[]) => {
      console.log(`socket on auth : ${currentRoom?.id}`)
      setInactiveUsers(currentInactiveUsers)
      setRefreshChat(true)
    })

    if(currentRoom.id != '-1' && currentRoom.id != '0' && reload > 0) {
      setReload(0)
    }

    return () => {

      if(currentRoom.id == '-1' || currentRoom.id == '0') {
        if(reload < 100) { // Prevents infinite loops.
          setReload(reload + 1)
        } else {
          notifyUser(`Something Went Wrong, please try again later`, `warning`)
          setIsServerOnline(false)
          setHasErrors(false)
          setReload(0)
        }
      } else {
        setReload(0)
      }

      setMessageBeingEdited({...messagePlaceholder, previous : '', wasEdited : false})
      clearTimeout(timer)
      
      if(!firstLoad) {
        socket?.off()
        socket?.disconnect()
      } else {        
        setFirstLoad(false)
      }

    }
  //}, [rooms.length, messages.length, currentRoom.id, reload, auth, showNotifications])
  }, [rooms.length, currentRoom.id, reload, auth, showNotifications])

  useEffect(() => {

    if(!isServerOnline) {
      return
    }

    console.log(`Running "handle before unload" useEffect.`)

    if (currentUser.name != ``) {

      if(socket?.disconnected) {
        socket?.connect()
      }

      const localDelay = setTimeout(() => {
        addUserToOnlineList()
      }, 200)
         
      const handleBeforeUnload =  async () => { 
        const authInfo : TRes = await authStatus({})        
        socket?.connect()
        socket?.emit(`inactive`, {id : authInfo.id, name: currentUser.name, inactive: true})
      }

      window.addEventListener('beforeunload', handleBeforeUnload)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        socket?.off()
        socket?.disconnect()
        clearTimeout(localDelay)
      }

    }

  }, [currentUser.name])

  useEffect(() => {  
    
    if(!isServerOnline) {
      return
    }
    
    handleUserActivityRef.current = handleUserActivity

    if(!firstLoad) { // First load handled by retrieveCurrentUser
      setInactivityTimer()
    }    

    window.addEventListener('click', handleUserActivityRef.current)

    return () => {
      window.removeEventListener('click', handleUserActivityRef.current)
    }

  }, [userActivity])

  useEffect(() => {  

    if(!isServerOnline) {
      return
    }

    const spamInterval = setInterval(() => {
      if(spam) {
        sendMessage(`Spamming!`)
      }
    }, 1000)

    if(!spam) {
      clearInterval(spamInterval)
    }    

    return () => {
      clearInterval(spamInterval)
    }

  }, [spam])

  useEffect(() => {    
    if(!isServerOnline) {
      return
    }
    if (!messageBeingEdited.id) {
      scrollToLatest()
    }        
  }, [messages.length])

  useEffect(() => {
    if (refreshChat) {
      //notifyUser(`refreshing messages.`)
      retrieveMessages()
      setRefreshChat(false)
    }
  }, [refreshChat])

  useEffect(() => {
    if(!isServerOnline) {
      return
    }
    setReload(reload + 1)
  }, [auth])

  useEffect(() => {
    setNickname(null)
  }, [roomUsers.length])

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

  const onInputEditableMessage = (e : React.FormEvent<HTMLSpanElement>) => {
    const element = e.target as HTMLSpanElement
    const msg = element?.textContent ? element.textContent : ''
    setMessageBeingEdited({...messageBeingEdited, content : msg})
  }

  const onBlurEditableMessage = (e : React.FocusEvent<HTMLSpanElement, Element>) => {

    const targetElement = e.relatedTarget as HTMLButtonElement
    const isButton = targetElement?.id.includes(editMenuButtonPrefix)
    
    if (!targetElement || !isButton) {

      if (messageContainerRef.current && messageBeingEdited.wasEdited == true) {
        messageContainerRef.current.textContent = `${messageBeingEdited.previous}`
      }

      setMessageBeingEdited({
        ...messagePlaceholder,
        previous : '',
        wasEdited : false
      })

      //setReload(reload + 1)

    }

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
        const socketPayload : TSocketPayload = {
          notification : `The message "${cropMessage(editedMessage)}" was deleted on ${currentRoom.name}`
        }
        socket?.emit('messageChange', socketPayload)
        setMessageBeingEdited({...messagePlaceholder, previous : '', wasEdited : false})
        setRefreshChat(true)
        break
      }

      case 'confirm' : {       
        // BUG : Editing a message triggers a re-rendering on the other end, if the user is editing a message
        // The text will be lost. use getMessageById to retrieve the edited message and update it separately
        // Instead of triggering a new re-render to retrieve the whole chat.
        if(messageBeingEdited.wasEdited == true) {
          messageContainerRef.current ? messageContainerRef.current.textContent = messageBeingEdited.content : ''
          messageBeingEdited.id ? await updateMessage(messageBeingEdited.id, messageBeingEdited.content) : ''
          const previousMessage = messageBeingEdited?.previous ? cropMessage(messageBeingEdited.previous, 20) : '...'
          const updatedMessage = messageBeingEdited?.content ? cropMessage(messageBeingEdited.content, 20) : '...'
          const socketPayload : TSocketPayload = {
            notification : `Message updated from "${previousMessage}" to "${updatedMessage}" on ${currentRoom.name}`
          }
          socket?.emit('messageChange', socketPayload)
          setRefreshChat(true)
        }
        setMessageBeingEdited({...messagePlaceholder, previous : '', wasEdited : false})
        break
      }

      case 'cancel' : {
        if (messageBeingEdited?.previous || messageBeingEdited.previous == ``) {
          if(messageBeingEdited.wasEdited == true) {            
            messageContainerRef.current ? messageContainerRef.current.textContent = messageBeingEdited.previous : ''
          }
          setMessageBeingEdited({...messagePlaceholder, previous : '', wasEdited : false})
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

        <div className={`flex ${verticalView ? `justify-start gap-2 rounded-lg w-80` : `justify-center gap-1 flex-col mx-2 min-w-28 max-w-28`} bg-slate-900 rounded-lg p-2 text-center items-center select-none`}>
          <h3 className={`bg-white text-black rounded p-1 w-full`}>Room Users</h3>
          <span className={`bg-transparent m-1 rounded-lg ${roomUsers.length >= 10 ? `overflow-y-scroll` : ``} w-full min-h-[20px] max-h-[312px]`}>
            {isUserInRoom ? <p 
              title={currentUser.name ? `You are online.` : `You are offline.`} 
              className={!userActivity ? `text-orange-400 font-bold` : `text-green-400 font-bold`}                    
              >{currentUser.name}
            </p> : ''}
            {    
              roomUsers.length > 0 ? 
                roomUsers.map((user, id) => {
                  
                  if(id == nickname) {
                    return <></>
                  }

                  const isCurrentUserName = currentUser.name == user

                  if(isCurrentUserName && nickname == null) {
                    setNickname(id)
                  }

                  const isUserInactive = inactiveUsers.find((iu) => iu == user)

                  const isUserOnline = onlineUsers.find((onlineUser) => {
                    if (onlineUser == user) {
                      return onlineUser
                    }
                  })
                  
                  let className = ''

                  if (isUserOnline) { // changed from ternary, causing problems on firefox.
                    if (isCurrentUserName && id == nickname) {
                      if (!userActivity) {
                        className = 'text-pink-400'
                      } else {
                        className = 'text-purple-400'
                      }
                    } else {
                      if (isUserInactive) {
                        className = 'text-orange-400'
                      } else {
                        className = 'text-green-400'
                      }
                    }
                  } else {
                    className = 'text-gray-300'
                  }

                  return <p 
                    title={isUserOnline ? `${user} is online.` : `${user} is offline.`} 
                    className={className}                    
                    key={`roomUser-${id}`}>{cropMessage(`${user}`, 8)}
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
              `${userActivity ? `🟢` : `🟠`} Chatting as ${cropMessage(currentUser.name, 8)} ` : 
              isServerOnline ? `🔴 Chatting as Guest` : `🔘 Offline`
            }
          </h3>
        
          <span className='flex bg-transparent m-2 cursor-pointer gap-1'>

            <button 
              title={`Toggle auto-scrolling : ${autoScroll ? `on` : `off`}`} 
              disabled={!!reload || firstLoad || !isServerOnline}
              className={ 
                ` ${autoScroll ? `bg-[#050D20] hover:bg-black` : `bg-[#050D20] hover:bg-black`}
                rounded-lg disabled:cursor-not-allowed`
              }              
              onClick={() => {
                // notifyUser(`Messages : ${messages.length}, Users : ${roomUsers.length}`)
                setAutoScroll((prev) => !prev)
              }}
            >   
              {autoScroll ?
              <FontAwesomeIcon icon={faArrowsRotate} width={48} height={48}/> :
              <FontAwesomeIcon icon={faPause} width={48} height={48}/>}
            </button>
            
            <button
              title={`Toggle hide/show message notifications from other chats`}
              disabled={!!reload || firstLoad || !isServerOnline}
              className={`bg-[#050D20] hover:bg-black rounded-lg disabled:cursor-not-allowed`}
              onClick={() => {
                setShowNotifications((prev) => !prev)
              }}
            >
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
                  className={`${isUserSender ? 'self-end' : 'self-start'} mx-3 p-2 ${primaryDefault} flex-shrink-1 rounded max-w-48 h-fit h-min-10 break-words cursor-pointer ${message.content != '' || isMessageSelected ? '' : 'text-slate-400'}`}
                  suppressContentEditableWarning={true}
                  contentEditable={isUserSender && isMessageSelected}
                  title={`Click to edit/delete a message.`}
                  onClick={(e) => {
                    if (isUserSender) {
                      if (!messageBeingEdited.content) {
                        onEnterMessageEditMode(e)
                      }
                    } else {
                      notifyUser(
                        `Message wrote by ${message.user} ${getTime(message.updated_at)} ${message.updated_at == message.created_at ? `` : `and updated at ${getTime(message.updated_at)}`}`
                      )
                    }
                  }}

                  onInput={(e) => {
                    onInputEditableMessage(e)
                  }}

                  onBlur={(e) => {
                    onBlurEditableMessage(e)
                  }}

                  onKeyDown={() => {
                    if(isMessageSelected && messageBeingEdited.wasEdited == false) {
                      setMessageBeingEdited((values) => ({
                        ...values,
                        wasEdited : true
                      }))
                    }
                  }}

                >                  
                  
                  {message.content != '' || isMessageSelected ? message.content : '...'}

                </span>
              
                <span className={`flex items-end justify-end cursor-pointer mx-3 px-1 gap-1 ${(isUserSender && isMessageSelected) ? '' : 'hidden'}`}>
                  
                  { !isMessageFocused && !messageBeingEdited.content ? <button
                    id={`${editMenuButtonPrefix}-edit`}
                    className='hover:bg-slate-600 rounded-full' 
                    data-action={`edit`} 
                    title={`Edit`} 
                    onClick={(e) => onClickEditModeIcon(e)}>
                      &#128393;
                  </button> : ''}
                  
                  { isMessageFocused ? <button
                    id={`${editMenuButtonPrefix}-confirm`}                    
                    className='hover:bg-slate-600 rounded-full' 
                    data-action={`confirm`} 
                    title={`Confirm`} 
                    onClick={(e) => onClickEditModeIcon(e)}>
                      &#10003;
                  </button> : ''}
                  
                  { !isMessageFocused && !messageBeingEdited.content ? <button 
                    id={`${editMenuButtonPrefix}-delete`}
                    className='hover:bg-slate-600 rounded-full' 
                    data-action={`delete`} 
                    title={`Delete`} 
                    onClick={(e) => onClickEditModeIcon(e)}>
                      &#128465;
                  </button> : ''}
                  
                  <button 
                    id={`${editMenuButtonPrefix}-cancel`}
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
            disabled={!!reload || firstLoad || !isServerOnline}
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
                disabled={!!reload || firstLoad || !isServerOnline}
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
                disabled={!!reload || firstLoad || !isServerOnline}
                className={`bg-slate-900 text-center hover:bg-black w-full h-full`}
                values={[{name : '...'}]}
              />

            }  

            <button title={`Copy room name to clipboard`} onClick={() => copyRoomNameToClipboard()}
              disabled={!!reload || firstLoad || !isServerOnline}
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
            disabled={!!reload || firstLoad || !isServerOnline}
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
            disabled={!!reload || firstLoad || !isServerOnline}
            title={`Delete all rooms`}
            onClick={() => onResetRoomsClick()}
          />

          <CustomButton
            value={`Get 🐜`}
            variationName='varthree'
            className={`bg-purple-900 active:bg-purple-800 w-20 h-full max-h-28 m-0 flex items-center justify-center`}
            disabled={!!reload || firstLoad || !isServerOnline}
            onClick={() => {
              const length = bugsToFix.length - 1
              const randomNumber = Math.random()
              const i = randomNumber * length | 0
              notifyUser(`${bugsToFix[i]}`)
            }}
          />
          
          <CustomButton
            value={`Test 🦾`}
            variationName='varthree'
            className={`${spam ? `bg-yellow-500` : `bg-black`} active:bg-gray-900 w-20 h-full max-h-28 m-0 flex items-center justify-center`}
            disabled={!!reload || firstLoad || !isServerOnline}
            title={`Currently spamming the chat.`}
            onClick={ async () => {                                                    
              //setSpam((lastSpam) => !lastSpam)
              //setUserActivity ? setUserActivity(!userActivity) : ''
              //setReload(reload + 1)
              //setRefreshChat(true)
              setReload(reload + 1)
            }}
          />

       </div>


      </section>      
             
      <div className='flex absolute bg-tranparent top-auto bottom-0 m-8 gap-2'>
        <h3 className={`flex mb-5 bg-purple-600 rounded-lg p-3`}>
          Render : {renderCounter}
        </h3>
        {/* <h3 className={`flex mb-5 bg-orange-600 rounded-lg p-3`}>
          Inactive Users : {inactiveUsers.length}
        </h3> */}
        {/* <h3 className={`flex mb-5 bg-cyan-600 rounded-lg p-3`}>
          {isTyping ? `💬` : `〰️`}
        </h3> */}
        <h3 className={`flex mb-5 ${socket?.connected ? `bg-green-600` : `bg-red-600` } rounded-lg p-3`}>          
          socket {socket?.connected ? 'on' : 'off'}
        </h3>
        {/* <h3 className={`flex mb-5 bg-black rounded-lg p-3`}>
          {`First Load : ${firstLoad ? `T` : `F`}`}
        </h3> */}
        <h3 className={`flex mb-5 bg-gray-500 rounded-lg p-3`}>
          {roomUsers.length}
        </h3>
        <h3 className={`flex mb-5 bg-gray-500 rounded-lg p-3`}>
          {`User in Room : ${isUserInRoom}`}
        </h3>        
      </div>
     
    </section>
    
  )
  
}


export default Chat
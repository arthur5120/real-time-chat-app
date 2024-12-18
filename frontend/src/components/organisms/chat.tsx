import { useContext, useEffect, useRef, useState, Fragment } from 'react'

import { 
  addUserToChat, 
  authStatus, 
  createChat, 
  createMessage, 
  deleteAllChats, 
  deleteMessage, 
  getChatById, 
  getChats, 
  getChatsByUserId, 
  getMessages, 
  getUserById, 
  getUsersByChatId, 
  updateMessage, 
} from '../../utils/axios-functions'

import { TUser, TMessage, TChatMessage, TChatRoom, TRes, TSocketAuthRequest, TLog } from '../../utils/types'
import { userPlaceholder, messagePlaceholder, roomsPlaceholder, currentRoomPlaceHolder, errorMessagePlaceholder, errorObjectPlaceholder } from '../../utils/placeholders'
import { capitalizeFirst, convertDatetimeToMilliseconds, cropMessage, getFormattedDate, getFormattedTime, getItemFromString, getTimeElapsed, getCSRFCookie, isThingValid, isThingValidSpecific, sortAlphabeticallyByAny, sortAlphabeticallyByName, sortByMilliseconds, sortChronogicallyByAny, verifyCSRFToken, generateUniqueId } from '../../utils/useful-functions'
import { authContext } from '../../utils/contexts/auth-provider'
import { socketContext } from '../../utils/contexts/socket-provider'
import { toastContext } from '../../utils/contexts/toast-provider'
import { healthContext } from '../../utils/contexts/health-provider'
import { primaryDefault, secondaryDefault } from '../../utils/tailwindVariations'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faEye, faEyeSlash, faPause, faArrowsRotate, faClipboard, faClipboardCheck, faArrowUpAZ, 
  faArrowDownAZ, faArrowUp19, faArrowUpShortWide, faArrowDownShortWide, faArrowDown19, faList, faRandom,
} from '@fortawesome/free-solid-svg-icons'
import TextPlaceholder from '../atoms/text-placeholder'
import Cookies from 'js-cookie'

import CustomSelect from '../atoms/select'
import CustomButton from '../atoms/button'
import Log from '../molecules/log'
import { editMenuButtonPrefix, emojis, orderText, textColors } from '../../utils/other-resources'
import MessageTime from '../molecules/message-time'

type TCurrentRoom = {id : string, selectId : number, name : string}
type TRoom = {id : string, name : string}
type TRoomUser = {id : string, name ? : string, diff ? : {nameEmoji ? : string, nameColor ? : string}}
type TFullUser = {id ? : string} & TUser & {diff ? : {nameEmoji ? : string, nameColor ? : string}}
type TMessageBeingEdited = TChatMessage & {previous ? : string, wasEdited : boolean}
type TSocketPayload = Partial<{userId : string, userName : string, content : string, notification : string, roomName : string, roomId : string, notifyRoomOnly : boolean}>
type TRoomLists = Partial<{currentOnlineUsers : number, currentInactiveUsers : number, currentRoomUsers : number, currentTypingUsers : number}>
type TErrorObject = {expired : boolean, message : string, timestamp : number,}

const Chat = () => {

  const [rooms, setRooms] = useState<TRoom[]>(roomsPlaceholder)
  const [currentRoom, setCurrentRoom] = useState<TCurrentRoom>(currentRoomPlaceHolder)
  const [isUserInRoom, setIsUserInRoom] = useState(false)
  const [refreshRooms, setRefreshRooms] = useState(false)
  const [currentUser, setCurrentUser] = useState<TFullUser>(userPlaceholder)
  const [roomUsers, setRoomUsers] = useState<TRoomUser[]>([]) // Turn all these user lists into one later.
  const [onlineUsers, setOnlineUsers] = useState<TRoomUser[]>([])
  const [inactiveUsers, setInactiveUsers] = useState<TRoomUser[]>([])
  const [typingUsers, setTypingUsers] = useState<TRoomUser[]>([])
  const [typingDelay, setTypingDelay] = useState<NodeJS.Timeout | null>(null)
  const [userActivity, setUserActivity] = useState(true)
  const [message, setMessage] = useState<{senderID ? : string} & TChatMessage>(messagePlaceholder)
  const [messages, setMessages] = useState<TChatMessage[]>([])
  const [searchText, setSearchText] = useState<string>(``)  
  const [refreshChat, setRefreshChat] = useState(false)
  const [updateUserLists, setUpdateUserLists] = useState(false)
  const [messageBeingEdited, setMessageBeingEdited] = useState<TMessageBeingEdited>(messagePlaceholder)
  const [showNotifications, setShowNotifications] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const [verticalView, setVerticalView] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [updateTypingState, setUpdateTypingState] = useState(true)
  const [inactivityTimerId, setInactivityTimerId] = useState<NodeJS.Timeout | null>(null)
  const [renderCounter, setRenderCounter] = useState(0)
  const [spam, setSpam] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [useDelayOnEmit, setUseDelayOnEmit] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)
  const [reload, setReload] = useState(1)  
  const [errorList, setErrorList] = useState<TErrorObject[]>([])
  const [hasErrors, setHasErrors] = useState(false)
  
  const [log, setLog] = useState<TLog[]>([])
  const [filteredLog, setFilteredLog] = useState<TLog[]>([])
  const [showLog, setShowLog] = useState(false)
  const [consecutiveMessages, setConsecutiveMessages] = useState<number[]>([])
  const [showSpamWarning, setShowSpamWarning] = useState(false)
  const [spamCountdown, setSpamCountdown] = useState(0)
  const [logOrder, setLogOrder] = useState(0)
  const [reverseLogOrder, setReverseLogOrder] = useState(false)
  const [messageTimeUpdate, setMessageTimeUpdate] = useState(false)

  let chatContainerRef = useRef<HTMLDivElement>(null)
  let logContainerRef = useRef<HTMLDivElement>(null)
  let chatRoomContainerRef =  useRef<HTMLSelectElement>(null)
  let messageContainerRef =  useRef<HTMLSpanElement>(null)
  let handleUserActivityRef = useRef<() => void>(() => {})
  let changeUserActivityStatusRef = useRef<(ToInactive : boolean) => void>(() => {})
  let showNotificationsRef = useRef<boolean>(showNotifications)
  let currentRoomIdRef = useRef<string>(currentRoom.id)
  let currentUserIdRef = useRef<string | undefined>(currentUser.id)

  const socket = useContext(socketContext)
  const {notifyUser} = useContext(toastContext)
  const {auth, currentAuthId} = useContext(authContext)
  const {serverStatus, updateServerStatus} = useContext(healthContext)

  const scrollToLatest = () => {
      if (autoScroll && chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
  }

  const filterLog = () => {    
    const normalizedSearchText = searchText.trim().toLocaleLowerCase().replace(/\\n/g, '').replace(/\s+/g, ' ')    
    const newFilteredLog = log.filter((entry) => {
      const compString = JSON.stringify(entry).trim().toLocaleLowerCase().replace(/\\n/g, '').replace(/\s+/g, ' ')
      if(compString.includes(normalizedSearchText)) {
        return entry
      } else {
        console.log(`Comp failed : ${normalizedSearchText} with ${compString}`)
      }
    })
    newFilteredLog.length > 0 ? setFilteredLog(newFilteredLog) : notifyUser(`No records found for "${cropMessage(searchText)}"`)
  }  

  const clearLogFilter = () => {    
    setFilteredLog([])
    setSearchText(``)
  }

  const notifyError = async (errorEvent ? : any) => {
    if (updateServerStatus) {
      await updateServerStatus()
    }    
    //console.log(`new error : ${JSON.stringify(errorEvent)}`)
    setErrorList((oldList) => {      
      let currentList = [...oldList]      
      const lastError = currentList.length > 0 ? currentList[currentList.length - 1] : errorObjectPlaceholder
      const message = errorEvent?.error && errorEvent?.message ? errorEvent.message : errorMessagePlaceholder
      const isMessageRepeated = message == lastError.message
      const timestampNow = Date.now()
      const isRangeAcceptable = lastError.timestamp == 0 || timestampNow - lastError.timestamp > 1000
      const isPresentInList = !!currentList.find((e) => e.message == message && timestampNow - e.timestamp < 1000)
      const expired = isMessageRepeated && !isRangeAcceptable || isPresentInList
      const newError = {
        expired : expired,        
        message : message,
        timestamp : expired ? lastError.timestamp : timestampNow,
      }
      if(!expired) {
        if (currentList.length - 1 >= 20) {          
          currentList = currentList.slice(1)
        }
        currentList.push(newError)
        setHasErrors(true)
      }
      return currentList
    })   
  }

  const getCookieSpam = () : number => {
    try {
      const cookieSpam = Cookies.get(`spam`)
      const cookieSpamResult = cookieSpam ? parseInt(cookieSpam) : 0
      return cookieSpamResult
    } catch (e) {
      notifyError(e)
      return 0
    }
  }

  const setCookieSpam = (lifespanSeconds : number) => {
    const lifespanDays = lifespanSeconds/(24*60*60)
    const lifespanSecondsString = JSON.stringify(lifespanSeconds)
    Cookies.set(`spam`, lifespanSecondsString, {
      expires: lifespanDays,
      path: `/`,
      sameSite : `strict`,
    })
  }  

  const getCookieLog = () : TLog[] => {
    try {
      const logString = Cookies.get(`log`) as string
      const logArray = logString ? JSON.parse(logString) : []
      return logArray
    } catch (e) {
      notifyError(e)
      return []
    }
  }
  
  const setCookieLog = (logArray : TLog[]) => {
    const logString = JSON.stringify(logArray)     
    Cookies.set( `log`, logString, { 
      expires : 3, 
      path: `/`, 
      sameSite : `strict`,
    })
  }

  const addToLog = (data : TLog) => {
    
    const currentDate = new Date()
    const dateNow = getFormattedDate(currentDate)
    const timeNow = getFormattedTime(currentDate)

    const {userName, time, content, roomName} =  data
    const newLogEntry : TLog = {
      userName : userName ? userName : `Unknown`,
      time : time ? time : `${currentDate}`,
      visualTime : time ? time : `${dateNow} ${timeNow}`,
      content : content ? content : `No content provided.`,
      roomName : roomName ? roomName : `global`,
    }
    
    setLog((data) => {
      let newLog = data
      if (newLog.length >= 10) {
        newLog.splice(0,1)
        newLog = sortChronogicallyByAny(newLog, `time`)        
      }
        newLog = [...newLog, newLogEntry]
      setCookieLog(newLog)
      return newLog
    })
    
  }

  const isSpamming = (hereNow : number) => {

    if (spamCountdown > 0 || showSpamWarning) {      
      return true
    }

    const arrayCapacity = 20
    const messageCount = 5
    const messageInterval = 10
    const earliestMessageIndex = consecutiveMessages.length - messageCount
    const earliestMessage = earliestMessageIndex >= 0 ? consecutiveMessages[earliestMessageIndex] : 0
    const messageDiff = ((hereNow - earliestMessage)/1000)
    const spamResult = consecutiveMessages.length >= messageCount ? messageDiff <= messageInterval : false
    
    if(consecutiveMessages.length >= arrayCapacity) {
      const first = consecutiveMessages[arrayCapacity - 2]
      const second = consecutiveMessages[arrayCapacity - 1]
      setConsecutiveMessages([first, second, hereNow])
    } else if(!spamResult) {
      setConsecutiveMessages((current) => ([
        ...current,
        hereNow
      ]))
    }

    if(spamResult) {
      const cooldownPeriod = messageDiff | 0
      setShowSpamWarning(spamResult)
      setSpamCountdown(cooldownPeriod)
      setCookieSpam(cooldownPeriod)
    }

    return spamResult
  }  

  const addUserToOnlineList = async () => {
    try {
      if(!serverStatus) { // Check
        return
      }
      const authInfo = await authStatus({})
      const isUserOnList = onlineUsers.find((u) => u.id == authInfo.id)
      if(!isUserOnList) {
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
    } catch (e) {
      console.log(`Error when adding user to online list.`)
      notifyError(e)
    }
  }

  const retrieveCurrentUser = async () => {

    console.log(`FUNCTION : Retrieving current user.`)

    try { 
      if(!serverStatus) { // Check
        return
      }
      const authInfo : TRes = await authStatus({})
      const user = await getUserById(authInfo.id)
      const emoji = getItemFromString(`${authInfo.id}`, emojis)
      const color = getItemFromString(`${authInfo.id}`, textColors)
  
      setCurrentUser({
        id : authInfo.id, // Added later
        name : user.name,
        username : user.username,
        email : user.email,
        role : authInfo.role,
        diff : {nameEmoji : emoji, nameColor : color}
      })

      if(firstLoad) {
        setInactivityTimer(user.name)
      }

    } catch(e) {
      notifyError(e)
      console.log(`error : retrieving the current user.`)
    }

  }

  const checkForUserInRoom = async (roomId : string, userId ? : string) => {

    const isRoomIdValid = roomId && typeof roomId === 'string'

    if(!isRoomIdValid) {
      return
    }    
    
    try {    

      let userIdToFind = userId

      if (!userIdToFind) {
        if (currentUser.id) {
          userIdToFind = currentUser.id
        } else {
          if(!serverStatus) { // Check
            return
          }
          const authInfo = await authStatus({})          
          userIdToFind = authInfo.id
        }
      }
      
      const usersInRoom = await getUsersByChatId(roomId)
      const foundUser = usersInRoom.find((user : {userId : string}) => user.userId == userIdToFind)
      return !!foundUser

    } catch (e) {
      notifyError(e)
    }
    
  }

  const createRoomIfNoneAreFound = async () => {
    
    console.log(`FUNCTION : Creating room if none are found.`)

    try {

      const localRooms = await getChats()
      const hasValidRooms = !!localRooms[0]

      if(!hasValidRooms) {
        await createChat()        
      }

    } catch (e) {
      notifyError(e)
      console.log(`error : creating room if none are found.`)
    }

  }

  const retrieveRooms = async () => {

    console.log(`FUNCTION : Retrieving rooms.`)    

    try {

      if(!serverStatus) { // Check
        return
      }

      const unsortedLocalRooms = await getChats() as TChatRoom[]
      const sortedLocalRooms = sortAlphabeticallyByName(unsortedLocalRooms)
      const hasValidRooms = !!sortedLocalRooms[0]
      const authInfo : TRes = await authStatus({})
      const chats : {userId : string, chatId : string}[] = authInfo?.id && authInfo.id != `none` ? await getChatsByUserId(authInfo.id) : []

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

        const foundUserInChat = chats?.length > 0 ? chats.find((c) => c.chatId == sortedLocalRooms[0].id) : ''
        setIsUserInRoom(!!foundUserInChat)

      } else if (!isNumberOfRoomsTheSame!) {
        const updatedSelectId = sortedLocalRooms.findIndex((room) => room.id.trim() == currentRoom.id.trim())
        setCurrentRoom({
          id : sortedLocalRooms[updatedSelectId].id,
          selectId : updatedSelectId,
          name : sortedLocalRooms[updatedSelectId].name
        })
        const foundUserInChat = chats?.length > 0 ? chats.find((c) => c.chatId == sortedLocalRooms[updatedSelectId].id) : ''
        setIsUserInRoom(!!foundUserInChat)
        setRefreshChat(true)        
      } else {
        const foundUserInChat = chats?.length > 0 ? chats.find((c) => c.chatId == currentRoom.id) : ''
        setIsUserInRoom(!!foundUserInChat)
      }

      setRooms(sortedLocalRooms)

    } catch (e) {      
      notifyError(e)
      console.log(`error : retrieving rooms.`)
    }
    
  }

  const retrieveMessages = async () => {
    
    console.log(`FUNCTION : Retrieving messages.`)
    
      try {

        if(!serverStatus) { // Check
          return
        }

        if(firstLoad) {          
          const cookieSpam = getCookieSpam()
          if(cookieSpam > 0) {
            setShowSpamWarning(true)
            setSpamCountdown(cookieSpam)
          }
          const cookieLog = getCookieLog()
          setLog(cookieLog)
        }

        if(currentRoom.id == '-1') {
          setRefreshRooms(true)          
          return
        }

        const authInfo = await authStatus({})
        const rawMessages = await getMessages() // Getting all messages to filter them based on room, change this later.              
        const filteredMessages = rawMessages.filter((m : TMessage) => m.chatId == currentRoom.id)
        const uniqueIdList = new Set<string>()
        const roomUserList : TRoomUser[] = []
    
        const convertedMessages = filteredMessages.map((m : TMessage) => {

          const emoji = getItemFromString(`${m.senderId}`, emojis)
          const color = getItemFromString(`${m.senderId}`, textColors)

          if(!uniqueIdList.has(m.senderId)) {
            uniqueIdList.add(m.senderId)
            roomUserList.push({
              id : m.senderId,
              name : m.senderName,
              diff : {nameColor : color, nameEmoji : emoji}
            })
          }

          return {
            id : m.id,
            user: m.senderId == authInfo.id ? `${emoji} ${currentUser.name}` : `${emoji} ${m.senderName}`,
            content: m.content,
            created_at: convertDatetimeToMilliseconds(m.created_at),
            updated_at: convertDatetimeToMilliseconds(m.updated_at),
            room: m.chatId,
            isUserSender : m.senderId == authInfo.id
          }

        })
            
        const unsortedRoomUserList = roomUserList as {id : string, name : string}[]
        const sortedRoomUserList = sortAlphabeticallyByAny(unsortedRoomUserList, `name`)
        const sortedMessages = sortByMilliseconds(convertedMessages)

        setRoomUsers(sortedRoomUserList)
        setMessages(sortedMessages)

      } catch (e) {
        notifyError(e)
        console.log(`error : retrieving messages.`)
      }

  }

  const addMessage = (newMessage : TChatMessage) => {
    setMessages((rest) => ([
      ...rest,
      newMessage,
    ]))
  }

  const resetMessageContent = () => {
    setMessage((rest) => ({
      ...rest,
      content : ''
    }))
  }

  const sendMessage = async (messageContent = '') => {
    
    try {

      if(!serverStatus) { // Check
        return
      }

      const dateTimeNow = Date.now()
      const isSpammingResult = isSpamming(dateTimeNow) 
      const isCookiePresent = getCSRFCookie()
      
      if(!isCookiePresent) {
        notifyUser(`Something went wrong, please refresh the page.`, `warning`)
        resetMessageContent()
        return
      }

      if(isSpammingResult) {
        notifyUser(`Slow down! Too many messages!`, `warning`)
        resetMessageContent()
        return
      }

      const newMessage : TChatMessage = {
        user : currentUser?.name ? currentUser.name : '',
        content : messageContent == '' ? message.content : messageContent,
        created_at : dateTimeNow,
        updated_at : dateTimeNow,
        room : currentRoom.id,
      }

      if(newMessage.content.trim() == '') {
        notifyUser('Write something first!')
        return
      }
  
      const authInfo = await authStatus({})

      if (!authInfo.authenticated) {
        notifyUser('Not Allowed!', 'error')
        resetMessageContent()
        return
      }

      if (!isUserInRoom) {
        const res = await addUserToChat(authInfo.id, currentRoom.id)        
      }
  
      const savedMessageId = await createMessage(
        authInfo.id,
        currentRoom.id,
        newMessage.content,
        newMessage.user,
      ) as string

      const savedMessage = {
        id : savedMessageId,
        ...newMessage,
        senderID : currentUser.id,
        user : currentUser?.name ? `${currentUser.diff?.nameEmoji} ${currentUser.name}` : '',
        isUserSender : false
      }

      if(socket?.disconnected) {
        socket?.connect()
      }

      socket?.emit(`updateTyping`, {id : currentUser.id, name : currentUser.name, isTyping : false})

      const delay = useDelayOnEmit ? 500 : 0 // Prevents the socket from being disconnected too early.

      setTimeout(() => { // setTimeout start        

        const socketPayload = {
          user_id : currentUser.id,        
          message : savedMessage,
          currentRoomUsers : roomUsers.length
        }

        socket?.emit(`sendMessage`, socketPayload, (response : {received : boolean} & TRoomLists) => { // callback

          if (response) {

            const {currentOnlineUsers, currentInactiveUsers, currentTypingUsers, received} = response
            const areOnlineUsersValid = isThingValid(currentOnlineUsers)
            const areInactiveUsersValid = isThingValid(currentInactiveUsers)
            const areTypingUsersValid = isThingValid(currentTypingUsers)
            const areOnlineListsDifferent = onlineUsers.length != currentOnlineUsers
            const areInactiveListsDifferent = inactiveUsers.length != currentInactiveUsers
            const areTypingUsersDifferent = typingUsers.length != currentTypingUsers

            if(
                areOnlineUsersValid && areOnlineListsDifferent || 
                areInactiveUsersValid && areInactiveListsDifferent || 
                areTypingUsersValid && areTypingUsersDifferent
            ) {
              setUpdateUserLists(true)
            }

            console.log(`Message Sent Successfully : ${received}`)

          } else {
            notifyError()
            console.log(`error : failed when sending message to socket.`)
          }

        })

        if(currentUser?.name && !isUserInRoom) {

          const socketPayload : TSocketPayload = {     
            userId : currentUser.id,
            roomId : currentRoom.id,
            content : `has entered`,
            notification : `${capitalizeFirst(currentUser.name)} has entered ${currentRoom.name}`,
            notifyRoomOnly : true,
          }
          
          setRoomUsers(() => {
            type TRoomUserPartial = {id: string, name: string}
            const unsortedList = [...roomUsers, {id : authInfo.id, name : currentUser.name}] as TRoomUserPartial[]
            const sortedList = sortAlphabeticallyByAny(unsortedList, `name`)
            return sortedList
          })
          setIsUserInRoom(true)
          socket?.emit(`minorChange`, socketPayload)

        }

      }, delay) // setTimeout end

      console.log(`Sending message : ${JSON.stringify(savedMessage)}, socket connection : ${socket?.connected}`)

      addMessage({...savedMessage, isUserSender : true})
      resetMessageContent()
      setUseDelayOnEmit(false)

    } catch (e) {
      notifyError(e)
      console.log(`error : when sending message.`)
      setUseDelayOnEmit(false)
    }

  }

  const createRoom = async () => {

    try {

      if(!serverStatus) {
        return
      }

      const isCookiePresent = getCSRFCookie()
    
      if(!isCookiePresent) {
        notifyUser(`Something went wrong, please refresh the page.`, `warning`)
        resetMessageContent()
        return
      }

      const userInfo = await authStatus({})

      if (!userInfo.authenticated) {
        notifyUser('Not Allowed!', 'error')
        return
      }

      if(cooldown) {      
        notifyUser(`Please Wait a Moment`,`warning`)
        return
      }
      
      setCooldown(5000)

      const notificationMessage = `New Room Created!`
      const creationMessage = `created a new room`      

      await createChat()

      notifyUser(creationMessage, 'success')

      if(socket?.disconnected) {
	      socket?.connect()
      }

      const socketPayload : TSocketPayload = {
        userId : currentUser.id,
        userName: currentUser.name,
        content: creationMessage,
        notification: notificationMessage,
        //roomName: currentRoom.name, - No room name means global change, needs to notify everyone.
      }
      
      socket?.emit(`majorChange`, socketPayload)
      addToLog({userName : currentUser.name, content : creationMessage})
      console.log(`Creating chat, socket connection : ${socket?.connected}`)
            
      setReload(reload + 1)

    } catch (e) {
      notifyError(e)
      console.log(`error : when creating a new room.`)
    }

  }

  const notifyUserInRoom = async (selectedRoomId : string, roomMessage : string = ``) => {

    try {
      
      if(!isThingValidSpecific(selectedRoomId)) {
        return
      }

      const selectedRoom = await getChatById(selectedRoomId)
      const userChats = currentUserIdRef.current ? await getChatsByUserId(currentUserIdRef.current) : false
      const userPresentInRoom = userChats?.length > 0 ? userChats.find((r : {chatId : string}) => r.chatId == selectedRoomId) : false      

      if(!!userPresentInRoom && !!selectedRoom) {
        notifyUser(`${roomMessage != `` ? roomMessage : `New message in `}${selectedRoom.name}`)
      }

    } catch (e) {
      notifyError(e)
      console.log(`error : when notifying the user in room. ${e}`)
    }

  }

  const deleteAllRooms = async () => {

    try {      

      if(socket?.disconnected) {
        socket?.connect()
      }

      const notificationMessage = `All rooms deleted, a fresh one was created`      
      const logMessage = `deleted all rooms and created a new one`
      
      const socketPayload : TSocketPayload = {
        userId : currentUser.id,
        userName : currentUser.name,
        content : logMessage,
        notification : notificationMessage,
        //roomName : currentRoom.name, - Global change, needs to notify everyone.
      }

      setTimeout(() => {        
        socket?.emit(`majorChange`, socketPayload)
        addToLog({userName : currentUser.name, content : logMessage})
      }, 200)

      console.log(`Deleting Rooms, socket connection : ${socket?.connected}`)
      
      await deleteAllChats()
      await retrieveRooms()
            
      setReload(reload + 1)
      setUseDelayOnEmit(true)

    } catch (e) {
      notifyError(e)
      console.log(`error : when deleting all rooms.`)
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

    try {
      if(!serverStatus) { // Check
        return
      }
  
      const isCookiePresent = getCSRFCookie()
  
        if(!isCookiePresent) {
          notifyUser(`Something went wrong, please refresh the page.`, `warning`)
          resetMessageContent()
          return
        }

      const userInfo = await authStatus({})
    
      if (!userInfo.authenticated || userInfo.role != 'Admin') {
        notifyUser('Not Allowed!', 'error')
        return
      }
  
      if(!cooldown) {
                 
        setCurrentRoom({ id: '-1', selectId: 0, name : ''})
  
        await deleteAllRooms()
  
        setCooldown(5000)
  
      } else {
        notifyUser(`Please Wait a Moment`,`warning`)
      }
    } catch (e) {
      console.log(`Error on rooms reset.`)
      notifyError(e)      
    }

  }

  const initializeRooms = async () => {
    await createRoomIfNoneAreFound()
    await retrieveRooms()
    await retrieveMessages()
  }

  const initializeAppData = async () => {
    await retrieveCurrentUser()
    await createRoomIfNoneAreFound()
    await retrieveRooms()
    await retrieveMessages()    
  }

  const changeUserActivityStatus = (ToInactive : boolean) => {
    if(!currentUser.id) {
      return
    }
    inactivityTimerId ? clearTimeout(inactivityTimerId) : ''
    if (ToInactive) {      
      setUserActivity(false)
      socket?.connect()
      socket?.emit(`updateInactive`, { id : currentUser.id, name: currentUser.name, inactive: true })
    } else {
      setUserActivity(true)
      socket?.connect()
      socket?.emit(`updateInactive`, { id : currentUser.id, name: currentUser.name, inactive: false })
      const timerId = setTimeout(() => {                                
        setUserActivity(false)
        socket?.connect()
        socket?.emit(`updateInactive`, { id : currentUser.id, name: currentUser.name, inactive: true })
      }, 60000) // Time until inactivity
      setInactivityTimerId(timerId)
    }
  }
  
  const setInactivityTimer =  async (localUserName = null) => {         
    try {         
      if(!serverStatus && !currentUser.id) { // Check
        return
      }      
      if (userActivity) {      
        const currentUserName = localUserName ? localUserName : currentUser.name
        const timerId = setTimeout(async () => {                                
          setUserActivity(false)                  
          socket?.connect()
          socket?.emit(`updateInactive`, { id : currentUser.id, name: currentUserName, inactive: true })
        }, 60000) // Time until inactivity
        setInactivityTimerId(timerId)
      }
    } catch(e) {
      console.log(`Error when setting inactivity timer.`)
      notifyError(e)
    }
  }

  const handleUserActivity = async () => {
    try {
      if(!serverStatus || !currentUser.id) { // Check
        return
      }
  
      if (!userActivity) {      
        setUserActivity(true)        
        socket?.connect()
        socket?.emit(`updateInactive`, { id : currentUser.id, name: currentUser.name, inactive: false })
        inactivityTimerId ? clearTimeout(inactivityTimerId) : ''
      }
    } catch(e) {
      console.log(`Error when handling user activity.`)
      notifyError(e)
    }
 
  }

  const retrieveUserLists = async () => {      
    try {
      socket?.connect()            
      socket?.emit(`authList`, null, (value : TRoomUser[]) => { // payload, callback
        if (isThingValid(value)) {
          setOnlineUsers(value)
        }         
      })
      socket?.emit(`inactiveList`, null, (value : TRoomUser[]) => { // payload, callback        
        if (isThingValid(value)) {
          setInactiveUsers(value)          
        }
      })
      socket?.emit(`typingList`, null, (value : TRoomUser[]) => { // payload, callback
        if (isThingValid(value)) {
          setTypingUsers(value)
        }
      })
    } catch (e) {      
      notifyError(e)
    }
  }
  
  const returnOrderIcon = (orderNumber : number) => {
    if(orderNumber >= 2) { // room name            
      return (
        !reverseLogOrder ? 
        <FontAwesomeIcon icon={faArrowUpShortWide} width={48} height={48}/> : 
        <FontAwesomeIcon icon={faArrowDownShortWide} width={48} height={48}/>
      )
    } else if (orderNumber >= 1) { // user name
      return (
        !reverseLogOrder ? 
        <FontAwesomeIcon icon={faArrowUpAZ} width={48} height={48}/> : 
        <FontAwesomeIcon icon={faArrowDownAZ} width={48} height={48}/>)
    } else { // chronologically
      return (
        !reverseLogOrder ? 
        <FontAwesomeIcon icon={faArrowUp19} width={48} height={48}/> : 
        <FontAwesomeIcon icon={faArrowDown19} width={48} height={48}/>
      )
    }    
  }

  const returnMessages = () => {

    return (
      messages?.map((message : TChatMessage, id : number) => {

        // 🥗 🌮 🍣 🍙 🍘 🍥 🍨 ☕️ 🎂 🥡 🍵 🍢🍡

        const isUserSender = message.isUserSender
        const isMessageSelected = message.id == messageBeingEdited.id
        const isMessageFocused = document.activeElement == messageContainerRef.current
        const userEmoji = currentUser.diff?.nameEmoji ? currentUser.diff?.nameEmoji : `🍣`
        const userName = currentUser.name ? currentUser.name : `You`
        const showUpdatedAt = message.created_at != message.updated_at
        const messageCreatedAt = getTimeElapsed(message.created_at)
        const messageUpdatedAt = showUpdatedAt ? getTimeElapsed(message.updated_at) : ``
        
        return (

          <Fragment key={`message-fragment-${id}`}>

            <span className={`${isUserSender ? 'self-end' : 'self-start'} mx-3 py-2 justify-end bg-transparent`}>
              <h4 className={`bg-transparent font-semibold ${isUserSender ? 'text-yellow-500 cursor-default' : ''}`}>
                {isUserSender ? `${userEmoji} ${userName}` : `${message.user}`}
              </h4>
            </span>
                        
            <span // Editable component with `children` managed by React.
              
              data-id={message.id}
              ref={isMessageSelected ? messageContainerRef : null}
              className={`${isUserSender ? 'self-end' : 'self-start'} mx-3 p-2 ${primaryDefault} flex-shrink-1 rounded max-w-48 h-fit h-min-10 break-words cursor-pointer ${message.content != '' || isMessageSelected ? '' : 'text-slate-400'}`}
              suppressContentEditableWarning={true}
              contentEditable={isUserSender && isMessageSelected}
              title={isUserSender ? `Click to edit/delete this message.` : `Click to view details about this message.`}
              data-action={`confirm`}
              onClick={(e) => {                    
                const isCookiePresent = getCSRFCookie()
                if(!isCookiePresent) {
                  notifyUser(`Something went wrong, please refresh the page.`, `warning`)
                  resetMessageContent()
                  return
                }
                if (isUserSender) {
                  if (!messageBeingEdited.content) {
                    onEnterMessageEditMode(e)
                  }
                } else {
                  notifyUser(
                    `Message wrote by ${message.user} ${getTimeElapsed(message.updated_at)} ${message.updated_at == message.created_at ? `` : `and updated at ${getTimeElapsed(message.updated_at)}`}`
                  )
                }
              }}

              onInput={(e) => {
                onInputEditableMessage(e)
              }}

              onBlur={(e) => {
                onBlurEditableMessage(e)
              }}

              onKeyDown={(e) => {                    
                if (e.key === "Enter") {
                  if (e.ctrlKey || e.metaKey) {
                    onClickEditModeIcon(e)
                  }
                }
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
              
              { isMessageFocused || messageBeingEdited.content ? <button
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

            <span key={`msg-time-${id}`} className={`${isUserSender ? 'self-end' : 'self-start'} mx-2 p-1 justify-end bg-transparent`}>
              <MessageTime                
                messageUpdatedAt={messageUpdatedAt}
                messageCreatedAt={messageCreatedAt}
                showUpdatedAt={showUpdatedAt}
                messages={messages}
                updateFlag={messageTimeUpdate}
              />            
            </span>            

          </Fragment>

        )

      })
    )

  } // returnMessages-END

  useEffect(() => { // Socket

    console.log(`Running Socket useEffect Current Room Id : ${currentRoomIdRef.current}`)    

    if(!serverStatus) {
      return
    }           
      
    retrieveUserLists()

    socket?.on(`sendMessage`, (payload : {message : TChatMessage} & TRoomLists) => {

      console.log(`socket on sendMessage : ${currentRoomIdRef.current}`)
      
      const {message : msg} = payload // currentRoomUsers, currentOnlineUsers, currentInactiveUsers
      const {id, user_id, room} = msg
      const firstMessageId = messages?.length > 0 ? messages[0].id : -1
      const isRoomIdValid = room && isThingValidSpecific(room) // Redundant check for it to be recognized
      const isRoomMember = isRoomIdValid ? checkForUserInRoom(room) : false
      const shouldNotifyUser = isRoomMember && showNotificationsRef.current && user_id && user_id != currentUserIdRef.current      

      if (room == currentRoomIdRef.current) {
        if (id != firstMessageId) {
          addMessage(msg)
          setRefreshChat(true)
        }
      } else if(shouldNotifyUser) {            
          notifyUserInRoom(room)
      }

    })
        
    socket?.on(`minorChange`, (msg : TSocketPayload) => {
      const {userId, userName, notification, roomId, roomName, content, notifyRoomOnly} = msg
      const isRoomIdValid = roomId && isThingValidSpecific(roomId) // Redundant check for it to be recognized
      const isRoomMember = isRoomIdValid ? checkForUserInRoom(roomId) : false
      const shouldNotifyUser = notification && showNotificationsRef.current && userId && userId != currentUserIdRef.current
      const shouldAddToLog = userName && roomName && content
      console.log(`socket on minorChange : ${roomId}`)
        if(isRoomIdValid) {
          if (roomId == currentRoomIdRef.current || !notifyRoomOnly) { // if the message's global or if it's in the current room.
            shouldNotifyUser ? notifyUserInRoom(roomId, notification) : ``
            shouldAddToLog ? addToLog({userName : userName, roomName : roomName, content : content}) : ``
          } else if (isRoomMember) { // if not, but user is currently a member of the room.
            shouldNotifyUser ? notifyUserInRoom(roomId, notification) : ``
            shouldAddToLog ? addToLog({userName : userName, roomName : roomName, content : content}) : ``
          }          
        } else { // Send it to everyone if room is undefined.
          shouldNotifyUser ? notifyUser(notification, `info`) : ``
          shouldAddToLog ? addToLog({userName : userName, roomName : roomName, content : content}) : ``
        }        
        setRefreshChat(true)
    })
    
    socket?.on(`majorChange`, (payload : TSocketPayload) => {      
      const {userId, userName, roomName, notification, content} = payload
      const shouldNotifyUser = payload?.notification && notification != `` && userId && userId != currentUserIdRef.current
      console.log(`socket on majorChange : ${currentRoomIdRef.current}`)          
      setUseDelayOnEmit(true)      
      if (shouldNotifyUser) {
        notifyUser(notification, 'info')
      }            
      addToLog({userName : userName, roomName : roomName, content : content})
      setReload(reload + 1)
    })
    
    socket?.on(`auth`, (currentOnlineUsers : {id : string, name : string}[]) => {
      console.log(`socket on auth : ${currentRoomIdRef.current}`)
      setOnlineUsers(currentOnlineUsers)
      setRefreshChat(true)
    })
    
    socket?.on(`updateInactive`, (currentInactiveUsers : {id : string, name : string}[]) => {
      if(!serverStatus) {
        return
      }
      console.log(`socket on updateInactive : ${currentRoomIdRef.current}`)      
      const isUserGoingInactive = currentUserIdRef.current ? currentInactiveUsers.find((u) => u.id == currentUserIdRef.current) : false      
      changeUserActivityStatusRef.current(!!isUserGoingInactive)
      setInactiveUsers(currentInactiveUsers)
      setRefreshChat(true)      
    })
    
    socket?.on(`updateTyping`, (payload : TRoomUser & {isTyping : boolean}) => {
      console.log(`socket on updateTyping : ${currentRoomIdRef.current}`)
      const {id, name, isTyping} = payload
      if(isTyping) {
        if(id == currentUserIdRef.current) {
          setIsTyping(true)
        }
        setTypingUsers((values) => ([
          ...values,
          {id : id, name : name}
        ]))
      } else {
        if(id == currentUserIdRef.current) {
          setIsTyping(false)
        }
        let newTypingUsers = typingUsers
        const typingUserID = newTypingUsers.findIndex((u) => u.id == id)
        newTypingUsers.splice(typingUserID, 1)
        setTypingUsers(newTypingUsers)
      }      
    })    

    return () => {      
        socket?.off()
        socket?.disconnect()
    }

  }, [socket])

  useEffect(() => { // Main
    
    if(!serverStatus) {
      return
    }    

    currentRoomIdRef.current = currentRoom.id
    currentUserIdRef.current = currentUser.id

    setRenderCounter(renderCounter + 1)
    
    console.log(` - Running Main useEffect.`)
    
    const timer = setTimeout(() => {
      setCooldown(0)
    }, cooldown)

    if(copiedToClipboard) {
      setCopiedToClipboard(false)
    }

    if(reload > 0) {      
      initializeAppData()
    }    

    if(currentRoom.id != '-1' && currentRoom.id != '0' && reload > 0) {
      setReload(0)
    }

    return () => {

      if(currentRoom.id == '-1' || currentRoom.id == '0') {
        if(reload < 100) {          
          !refreshRooms ? setRefreshRooms(true) : null
        } else {          
          notifyError()
          setReload(0)
        }
      } else {
        setFirstLoad(false)
        setReload(0)
      }

      setMessageBeingEdited({...messagePlaceholder, previous : '', wasEdited : false})
      clearTimeout(timer)          

    }  

  }, [currentRoom, reload, auth])

  useEffect(() => { // Handle Before Unload 

    if(!serverStatus) {
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
        const authInfo = {id : currentUser.id}
        socket?.connect()
        socket?.emit(`updateInactive`, {id : authInfo.id, name: currentUser.name, inactive: true, beforeUnloadEvent : true})
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

  useEffect(() => {  // Handles Inactivity    
    if(!serverStatus) {
      return
    }    
    handleUserActivityRef.current = handleUserActivity
    changeUserActivityStatusRef.current = changeUserActivityStatus
    if(!firstLoad) { // First load handled by retrieveCurrentUser
      setInactivityTimer()
    }    
    window.addEventListener('click', handleUserActivityRef.current)
    return () => {
      window.removeEventListener('click', handleUserActivityRef.current)
    }
  }, [userActivity])

  useEffect(() => { // Typing status
    if(!serverStatus) {
      return
    }
    if(firstLoad || currentUser.name == '') {
      return
    }
    if(updateTypingState) {
      socket?.connect()
      socket?.emit(`updateTyping`, {id : currentUser.id, name : currentUser.name, isTyping : isTyping})
      setUpdateTypingState(false)
    }
    const typeTimeout = setTimeout(() => {
      setUpdateTypingState(true)
    }, 50)
    return () => {
      clearTimeout(typeTimeout)
    }
  }, [isTyping])   

  useEffect(() => { // Spam
    if(!serverStatus) {
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

  useEffect(() => { // Spam count
    if(!serverStatus) {
      return
    }
    if(!showSpamWarning || spamCountdown == 0) {
      return
    }
    const interval = spamCountdown * 1000
    const warningDelay = setTimeout(() => {
      setShowSpamWarning(false)      
      setSpamCountdown(0)
    }, interval)
    return () => {
      clearTimeout(warningDelay)
    }
  }, [showSpamWarning, spamCountdown])

  useEffect(() => { // Scrolls to the bottom
    if(!serverStatus) {
      return
    }
    if (!messageBeingEdited.id && !showLog) {
      scrollToLatest()
    }        
  }, [messages.length])

  useEffect(() => {  // Refresh the chat
    if(!serverStatus) {
      return
    }
    if (refreshChat) {      
      retrieveMessages()
      setRefreshChat(false)
    }
  }, [refreshChat])

  useEffect(() => { // Handles authentication related reloads
    if(!serverStatus) {
      return
    }
    setReload(reload + 1)
  }, [auth])  

  useEffect(() => { // User lists        
    if(!serverStatus) {
      return
    }
    if (updateUserLists) {
      retrieveUserLists()
      setUpdateUserLists(false)
    } 
  }, [updateUserLists])  

  useEffect(() => { // Refreshes Chat Rooms
    if(!serverStatus) {
      return
    }
    if(refreshRooms) {
      initializeRooms()
      setRefreshRooms(false)
    }
  }, [refreshRooms])
  
  useEffect(() => { // Notification Status
    if(!serverStatus) {
      return
    }
    showNotificationsRef.current = showNotifications
  }, [showNotifications])  

  useEffect(() => { // Error Notifications
    if(hasErrors && errorList.length > 0) {
       const lastIndex = errorList.length - 1
       const {message, expired} = errorList[lastIndex]
      if(!expired) {
        notifyUser(message, `warning`)
        setErrorList((currentList) => {
          let newList = [...currentList]
          return newList.map((e, i) => {      
            return i == lastIndex ? {...e, expired : true,} : e           
          })           
        })
      }            
      setHasErrors(false)
    }    
  }, [hasErrors])

  useEffect(() => { // Update isUserInRoom state
    if(!firstLoad && currentRoomIdRef && !isUserInRoom)  {
      const foundUserInChat = checkForUserInRoom(currentRoomIdRef.current)
      setIsUserInRoom(!!foundUserInChat)
    }
  }, [roomUsers, isUserInRoom, currentRoomIdRef])

  useEffect(() => { // Update UI if auth id changes. 
    if(!firstLoad && currentAuthId != currentUser.id) {
      setReload(reload + 1)
    }
  }, [currentAuthId])

  useEffect(() => { // Periodic Message Time Update

    const interval = setInterval(() => {
      setMessageTimeUpdate((prev) => !prev)
    }, 15000)

    return () => {
      clearInterval(interval)
    }

  }, [])  

  useEffect(() => { // Update User List
    const listTimeout = setTimeout(() => {
      setUpdateUserLists(true)
    }, 200)
    return () => {
      clearTimeout(listTimeout)
    }
  }, [])  

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

    }

  }

  const onClickEditModeIcon = async (e : React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLSpanElement>) => {

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
        try {
          messageBeingEdited.id ? await deleteMessage(messageBeingEdited.id) : ''
          const editedMessage = messageBeingEdited?.previous ?  messageBeingEdited.previous : ''
          const notificationMessage = `${currentUser.name ? capitalizeFirst(currentUser.name) : ``} deleted "${cropMessage(editedMessage)}" on ${currentRoom.name}`
          const logMessage = `deleted "${cropMessage(editedMessage)}"`
          const socketPayload : TSocketPayload = {
            userId : currentUser.id,
            userName : currentUser.name, 
            roomName : currentRoom.name, 
            roomId : currentRoom.id,
            notification : notificationMessage, 
            content : logMessage,
            notifyRoomOnly : true,
          }
          socket?.emit(`minorChange`, socketPayload)
          setMessageBeingEdited({...messagePlaceholder, previous : '', wasEdited : false})
          addToLog({userName : currentUser.name, roomName : currentRoom.name, content : logMessage})
          setRefreshChat(true)
          
        } catch(e) {   
          console.log(`Error when deleting message.`)
          notifyError(e)
        }
        break
      }

      case 'confirm' : {        
        try {
          if(messageBeingEdited.wasEdited == true) {          
            messageContainerRef.current ? messageContainerRef.current.textContent = messageBeingEdited.content : ''
            messageBeingEdited.id ? await updateMessage(messageBeingEdited.id, messageBeingEdited.content) : ''
            const previousMessage = messageBeingEdited?.previous ? cropMessage(messageBeingEdited.previous, 20) : '...'
            const updatedMessage = messageBeingEdited?.content ? cropMessage(messageBeingEdited.content, 20) : '...'
            const notificationMessage = `${currentUser?.name ? capitalizeFirst(currentUser.name) : ``} updated "${previousMessage}" to "${updatedMessage}" on ${currentRoom.name}`
            const logMessage = `updated "${previousMessage}" to "${updatedMessage}"`
            const socketPayload : TSocketPayload = {
              userId : currentUser.id,
              userName : currentUser.name,
              roomName : currentRoom.name,
              roomId : currentRoom.id,
              notification : notificationMessage, 
              content : logMessage,
              notifyRoomOnly : true,
            }
            socket?.emit(`minorChange`, socketPayload)
            addToLog({userName : currentUser.name, roomName : currentRoom.name, content : logMessage})
            setRefreshChat(true)
          }
          setMessageBeingEdited({...messagePlaceholder, previous : '', wasEdited : false}) 
        } catch(e) {
          console.log(`Error when confirming message.`)
          notifyError(e)
        }
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
          if (showLog) {
            return
          }
          setIsTyping(true)
          typingDelay ? clearTimeout(typingDelay) : ''
          const localTypingDelay = setTimeout(() => {
            setIsTyping(false)
          }, 500)
          setTypingDelay(localTypingDelay)
        } else {
          typingDelay ? clearTimeout(typingDelay) : ''
          const localTypingDelay = setTimeout(() => {
            setIsTyping(false)
          }, 500)
          setTypingDelay(localTypingDelay)
        }
      }}

    >

      <section className={usersOnlineSection}>

        <div className={`flex ${verticalView ? `justify-start gap-2 rounded-lg w-80` : `justify-center gap-1 flex-col mx-2 min-w-28 max-w-28`} bg-slate-900 rounded-lg p-2 text-center items-center select-none`}>
          <h3 className={`bg-white text-black rounded p-1 w-full`}>
            Room Users
          </h3>
          <span className={`bg-transparent m-1 rounded-lg ${roomUsers.length >= 10 ? `overflow-y-scroll` : ``} w-full min-h-[20px] max-h-[312px]`}>
            {isUserInRoom && auth ? <p 
              title={currentUser.name ? `You are online.` : `You are offline.`}
              className={`flex`}>

                <span
                  className={
                    `w-2 h-2 self-center mt-1 rounded-full ${
                      userActivity ? `bg-green-400` : `bg-orange-400`
                    }`
                  }
                ></span>

                <span
                  className={
                    `ml-2 ${
                      userActivity ? 
                      (currentUser?.diff?.nameColor ? currentUser?.diff?.nameColor : `text-green-400`) :
                      (currentUser?.diff?.nameColor ? currentUser?.diff?.nameColor : `text-orange-400`)
                    }`
                  }
                >
                  {`${currentUser?.name ? cropMessage(`${currentUser.name}`, 5) : ``}`}                  
                </span>

                <span className={`ml-auto`}>
                  {isTyping ? `💬` : `〰️`}
                </span>

            </p> : ''}
            {    
              roomUsers.length <= 0 && !isUserInRoom ? <TextPlaceholder value={`...`} className={`m-0 p-0`}/> :
                roomUsers.map((user : TRoomUser, id : number) => {

                  const isCurrentUser = currentUser.id == user.id                  

                  if(isCurrentUser) {
                    return
                  }

                  const isUserOnline = onlineUsers.find((ou) => ou.id == user.id)
                  const isUserInactive = isUserOnline ? inactiveUsers.find((iu) => iu.id == user.id) : null
                  const isUserTyping = typingUsers.find((tu) => tu.id == user.id)
                  
                  let textStyle = ``, backgroundStyle = ``, title = ``
                  const userNameColor = user?.diff?.nameColor ? user?.diff?.nameColor : `text-green-400`
                  const userNameColorInactive = userNameColor

                  if (isUserOnline) { // changed from ternary, causing problems on firefox.

                    if (!isUserInactive) { // Active
                      textStyle = `${userNameColor}`
                      backgroundStyle = `bg-green-400`
                      title = `${user.name} is online`
                    } else { // Inactive
                      textStyle = `${userNameColorInactive} italic`
                      backgroundStyle = `bg-orange-400`
                      title = `${user.name} is inactive`
                    }

                  } else { // Offline
                    textStyle = `text-gray-400`
                    backgroundStyle = `bg-gray-400`
                    title = `${user.name} is offline`
                  }

                  return (
                    <p title={`${title}`} className={`flex`} key={`roomUser-${id}`}>
                      <span className={`w-2 h-2 mt-1 self-center rounded-full ${backgroundStyle}`}>
                      </span>
                      <span className={` ml-2 ${textStyle}`}>
                        {cropMessage(`${user.name}`, 5)}
                      </span>
                      <span className={`ml-auto`}>
                        {isUserTyping ? `💬` : `〰️`}
                      </span>
                    </p>
                  )
                })
              
            }
          </span>
        </div>

      </section>

      <section className={chatSectionStyle}>

        <div className={`flex justify-between ${primaryDefault} rounded-lg w-80`}>          
          <h3 className='bg-transparent justify-start m-2'>            
            {            
            (auth && currentUser?.name) ? 
              `${userActivity ? `🟢` : `🟠`} Chatting as ${cropMessage(currentUser.name, 8)} ` : 
              serverStatus ? `🔴 Chatting as Guest` : `🔘 Server Offline`
            }
          </h3>
        
          <span className='flex bg-transparent m-2 cursor-pointer gap-1'>

            {
              !showLog ? <button 
                title={`Toggle auto-scrolling : ${autoScroll ? `on` : `off`}`}
                disabled={!!reload || firstLoad || !serverStatus}
                className={
                  ` ${autoScroll ? `bg-[#050D20] hover:bg-black` : `bg-[#050D20] hover:bg-black`}
                  rounded-lg disabled:cursor-not-allowed`
                }
                onClick={() => {
                  setAutoScroll((prev) => !prev)
                }}
              >
                {autoScroll ?
                <FontAwesomeIcon icon={faArrowsRotate} width={48} height={48}/> :
                <FontAwesomeIcon icon={faPause} width={48} height={48}/>}
              </button> : <button 
                title={`${orderText[logOrder]}`}
                disabled={!!reload || firstLoad || !serverStatus}
                className={
                  ` ${autoScroll ? `bg-[#050D20] hover:bg-black` : `bg-[#050D20] hover:bg-black`}
                  rounded-lg disabled:cursor-not-allowed`
                }
                onClick={() => {  
                  if(logOrder > 1) {
                    setLogOrder(0)
                  } else {
                    setLogOrder((prev) => prev + 1)
                  }                  
                }}
              >         
                {returnOrderIcon(logOrder)}
              </button>
            }
            
            {            
              !showLog ? <button
                title={`Toggle hide/show message notifications from other chats`}
                disabled={!!reload || firstLoad || !serverStatus}
                className={`bg-[#050D20] hover:bg-black rounded-lg disabled:cursor-not-allowed`}
                onClick={() => {
                  setShowNotifications((prev) => !prev)
                }}
              >
                {!showNotifications ? 
                <FontAwesomeIcon icon={faEyeSlash} width={48} height={48}/> : 
                <FontAwesomeIcon icon={faEye} width={48} height={48}/>}
              </button> : <button
                title={`Invert sort order`}
                disabled={!!reload || firstLoad || !serverStatus}
                className={`bg-[#050D20] hover:bg-black rounded-lg disabled:cursor-not-allowed`}
                onClick={() => {
                  setReverseLogOrder((prev) => !prev)
                }}
              >
                {reverseLogOrder ? 
                <FontAwesomeIcon icon={faRandom} width={48} height={48}/> :
                <FontAwesomeIcon icon={faList} width={48} height={48}/>}
              </button>           
            }           
            
          </span>

        </div>        

        <div 
          className={`flex flex-col gap-1 ${secondaryDefault} rounded-lg w-80 h-80 overflow-y-scroll`}
          ref={chatContainerRef}>

          { showLog ? <Log values={filteredLog.length == 0 ? log : filteredLog} ref={logContainerRef} order={logOrder} reverseOrder={reverseLogOrder}/> : 
            messages?.length <= 0 ? <TextPlaceholder className={`cursor-default`} value={`No messages yet...`}/> :             
            returnMessages()
          }
            
        </div>

        <div className={`flex ${primaryDefault} rounded-lg w-80 h-15 gap-2 p-1`}>

          {
            !showLog ? <textarea // Message Textbox
              name=''
              id=''
              className={`items-start ${secondaryDefault} text-white rounded-lg resize-none p-1 m-1 h-full w-full focus:outline-none focus:ring-2 ${showSpamWarning ? `focus:ring-orange-500` : `focus:ring-blue-500`}`}
              cols={41}
              rows={3}
              maxLength={191}
              onChange={(e) => {onTextareaChange(e)}}
              placeholder={spamCountdown > 0 ? `Please wait a sec...` : `Say something...`}
              value={message.content}
              onKeyDown={(e) => {
                handleUserActivity()
                if (e.key === "Enter") {
                  if (e.ctrlKey || e.metaKey) {
                    sendMessage()
                  }
                }
              }}
            /> : <textarea // Search Log Textbox
              name=''
              id=''
              className={`items-start ${secondaryDefault} text-white rounded-lg resize-none p-1 m-1 h-full w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
              cols={41}
              rows={3}
              disabled={filteredLog.length > 0}
              maxLength={191}
              onChange={(e) => {   
                if (filteredLog.length == 0) {
                  setSearchText(e.target.value)
                }
              }}
              placeholder={filteredLog.length == 0 ? `Search the log...` : `Log currently filtered for "${cropMessage(searchText)}"`}
              value={filteredLog.length == 0 ? searchText : ``}
              onKeyDown={(e) => {
                handleUserActivity()
                if (e.key === "Enter") {
                  if (e.ctrlKey || e.metaKey) {   
                    filteredLog.length == 0 ? filterLog() : clearLogFilter()
                  }
                }
              }}
            />
          }
          
          {
            !showLog ? <CustomButton // Send Message Button
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
              disabled={!!reload || firstLoad || !serverStatus}
              onClick={() => sendMessage()}
              title={`Post a message to current chat (Ctrl + Enter)`}
            /> : <CustomButton // Search Log Button
              value={
                <span className={`flex flex-col gap-1`}>
                  <h3 className='text-slate-100 group-hover:text-white'>
                    {filteredLog.length == 0 ? `Search` : `Clear`}
                  </h3>
                  <h3 className={`font-light text-sm text-slate-200 group-hover:text-slate-100`}>
                    Ctrl+Enter
                  </h3>
                </span>
              }
              className='p-2 bg-[#aa5a95] text-white rounded-lg m-1 active:bg-[#bd64a5] group'
              disabled={!!reload || firstLoad || !serverStatus}
              onClick={() => {
                filteredLog.length == 0 ? filterLog() : clearLogFilter()
              }}
              title={filteredLog.length == 0 ? `Search the log messages (Ctrl + Enter)` : `Clear the log filter (Ctrl + Enter)`}
            />
          }

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
                disabled={!!reload || firstLoad || !serverStatus}
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
                disabled={!!reload || firstLoad || !serverStatus}
                className={`bg-slate-900 text-center hover:bg-black w-full h-full`}
                values={[{name : '...'}]}
              />

            }  

            <button 
              title={`Copy room name to clipboard`}
              onClick={() => copyRoomNameToClipboard()}
              disabled={!!reload || firstLoad || !serverStatus}
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
            disabled={!!reload || firstLoad || !serverStatus || showLog}
            title={`Create a new room`}
            onClick={() => createRoom()}

          />
        
          { showLog ? <CustomButton
            value={
              <span className={`flex flex-col gap-1`}>
                <h3 className='text-slate-100 group-hover:text-white'>
                  Clear Log
                </h3>
              </span>
            }
            variationName='vartwo'
            className={`w-20 h-full max-h-28 m-0 flex items-center justify-center group`}
            disabled={!!reload || firstLoad || !serverStatus}
            title={`Delete All Records`}
            onClick={() => {
              clearLogFilter()
              setLog([])
              setCookieLog([])
            }}
          />
          : <CustomButton
            value={
              <span className={`flex flex-col gap-1`}>
                <h3 className='text-slate-100 group-hover:text-white'>
                  Reset Rooms
                </h3>
              </span>
            }
            variationName='vartwo'
            className={`w-20 h-full max-h-28 m-0 flex items-center justify-center group`}
            disabled={!!reload || firstLoad || !serverStatus}
            //disabled={true}
            title={`Delete all rooms`}
            //title={`Chat room removal functionality is being updated.`}
            onClick={() => onResetRoomsClick()}
          />}

          <CustomButton
            value={`Log`}
            variationName='varthree'
            className={`${showLog ? `bg-yellow-600 active:bg-yellow-600` : `bg-black active:bg-black`} w-20 h-full max-h-28 m-0 flex items-center justify-center`}
            disabled={!!reload || firstLoad || !serverStatus}
            title={`Shows either the history of messages or the chat`}
            onClick={() => {              
              setShowLog(!showLog)
              showLog ? clearLogFilter() : ``
              const scrollDelay = setTimeout(() => {
                scrollToLatest()
              }, 10)
              return () => {
                clearTimeout(scrollDelay)
              }
            }}
          />

          {/* 
          
          <CustomButton
            value={`Get 🐜`}
            variationName='varthree'
            className={`bg-purple-900 active:bg-purple-800 w-20 h-full max-h-28 m-0 flex items-center justify-center`}
            disabled={!!reload || firstLoad || !serverStatus}
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
            disabled={!!reload || firstLoad || !serverStatus}
            title={``}
            onClick={ async () => {     
              setTimeout(async () => {                
                changeUserActivityStatus(!userActivity)
                setUserActivity(false)
                socket?.connect()
                socket?.emit(`updateInactive`, { id : currentUser.id, name: currentUser.name, inactive: true })
              }, 500)
            }}
          /> 
          */}

       </div>

      </section>
             
      <div className='flex absolute bg-tranparent top-auto bottom-0 m-8 gap-2' > 
        {/*
        <h3 className={`flex mb-5 bg-cyan-600 rounded-lg p-3`}>
          {isTyping ? `💬` : `〰️`}
        </h3>
        <h3 className={`flex mb-5 bg-gray-500 rounded-lg p-3`}>
          (O : {onlineUsers.length})
          (I : {inactiveUsers.length})
          (R : {roomUsers.length})
        </h3>
        <h3 className={`flex mb-5 bg-pink-600 rounded-lg p-3`}>          
          filter : {logFilter}
        </h3>
        <h3 className={`flex mb-5 bg-purple-600 rounded-lg p-3`}>
        Render : {renderCounter}
        </h3>
        <h3 className={`flex mb-5 ${serverStatus ? `bg-green-600` : `bg-red-600` } rounded-lg p-3`}>
        server {serverStatus ? 'on' : 'off'}
        </h3>
        <h3 className={`flex mb-5 bg-orange-600 rounded-lg p-3`}>
        {JSON.stringify(tickCounter)}
        </h3>
        <h3 className={`flex mb-5 bg-gray-500 rounded-lg p-3`}>    
        {`!!reload : ${!!reload} || firstLoad : ${firstLoad} || !serverStatus ${!serverStatus} || showLog ${showLog}`}
        </h3>        
        */}
      </div>
     
    </section>
    
  )
  
}

export default Chat
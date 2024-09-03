import { Server } from "socket.io";

const io = new Server({
    cors : {origin : 'http://localhost:5173'}
})

let onlineUsers = [] // Turn all these into a single list later.
let onlineUsersNames = []
let inactiveUsers = []
let inactiveUsersNames = []
let typingUsers = new Set()
let nextExpirationCheck = -1
let setToLogout = []

const getExpirationTime = (minutes = 15) => {
    const dateNow = Date.now()
    const expirationTime = dateNow + (1000 * 60 * minutes)
    return expirationTime
}

const expirationCheck = (expirationTime) => {
    const hereNow = Date.now()
    return (hereNow - expirationTime) >= 0
}

setInterval(() => {
    const hereNow = Date.now()
    if (expirationCheck(nextExpirationCheck) || nextExpirationCheck == -1) {
        console.log(`Running Expiration Check`)
        nextExpirationCheck = hereNow + (60 * 1000 * 5)
        if(onlineUsers.length > 0) {
            const newList = onlineUsers.filter((user) => !expirationCheck(user.expirationTime))
            onlineUsers = newList
            onlineUsersNames = newList.map((user) => {
                return {id : user.id, name : user.name}
            })
        }
    }
    console.log(`Online : ${JSON.stringify(onlineUsersNames)}, inactive : ${JSON.stringify(inactiveUsersNames)} next check in ${(((nextExpirationCheck - hereNow) / (1000 * 60)) | 0)}m.`)
}, 5000)

const connectUser = (user) => { // user :  {id : string, name : string. expirationTime : number}
    
    try {
        
        if(!user?.id || user?.id == `` || user?.id == null || user?.id == `none`) {
            console.log(`invalid id while connecting`)
            return
        }

        const isUserOnline = onlineUsers.find((u) => u.id == user.id)

        if (!isUserOnline) {
            onlineUsers.push(user)
            onlineUsersNames.push({id : user.id, name : user.name})
        } else {
            setToLogout.push(user)
            return
        }
                
        const inactiveUserId = inactiveUsers.findIndex((u) => u.id == user.id)

        if(inactiveUserId > -1) {
            inactiveUsers.splice(inactiveUserId, 1)
            inactiveUsersNames.splice(inactiveUserId, 1)
        }

        console.log(`Connected : ${onlineUsers[onlineUsers.length - 1].id}`)

    } catch (e) {
        console.log(`Error while connecting : ${e}`)
    }
    
}

const disconnectUser = (userId) => { // string
    
   try {
    
        if(!userId || userId == `` || userId == null || userId == `none`) {
            console.log(`invalid id while disconnecting`)
            return
        }

       const onlineUserId = onlineUsers.findIndex((u) => u.id == userId)
       const inactiveUserId = onlineUserId != -1 ?         
       inactiveUsers.findIndex((u) => u.id == userId) : -1

        if (onlineUserId != -1) {
            onlineUsers.splice(onlineUserId, 1)
            onlineUsersNames.splice(onlineUserId, 1)
        } else {
            return
        }

        if(inactiveUserId != -1) {
            inactiveUsers.splice(inactiveUserId, 1)
            inactiveUsersNames.splice(inactiveUserId, 1)
        }

        console.log(`Disconnected : ${userId}`)

   } catch (e) {
        console.log(`Error while disconnecting : ${e}`)
   }
}

io.on('connection', (socket) => {
    
    socket?.on(`disconnect`, (reason) => {
        if (reason == `client namespace disconnect`) {
            //console.log(`scheduled disconnect`)
        } else {
            //console.log(`id : ${socket.id}, reason : ${reason}`)
        }
    })

    socket.on(`updateInactive`, (user) => {
                       
        const {id, name, inactive, handleBeforeUnload} = user

        console.log(`inactivity status change to ${inactive} for ${name}...`)        

        if(!name || name == `` || name == null || !id || id == `none`) {
            console.log(`Unable to change inactivity : Invalid name or id`)
            return
        }

        const onlineUser = onlineUsers.find((u) => u.id == id) 
        const duplicatedUser = setToLogout.find((u) => u.id == id)

        if(!onlineUser) {
            console.log(`Unable to change inactivity : Status user offline.`)
            return
        }

        if(onlineUser && duplicatedUser && handleBeforeUnload) {
            console.log(`Unable to change inactivity : Auto-logout due to duplicated sessions.`)
            return
        }

        const inactiveUserId = inactiveUsers.findIndex((u) => u.id == id)
                
        if (inactive == true) {
            if(inactiveUserId == -1) {
                console.log(`${name} went inactive.`)
                inactiveUsers.push({id : id, name : name, inactive : inactive})                
                inactiveUsersNames.push({id : id, name : name})
                socket.broadcast.emit(`updateInactive`, inactiveUsersNames)
            }
        } else {
            if(inactiveUserId > -1) {
                console.log(`${name} went active.`)
                inactiveUsers.splice(inactiveUserId, 1)
                inactiveUsersNames.splice(inactiveUserId, 1)
                socket.broadcast.emit(`updateInactive`, inactiveUsersNames)
            }
        }    

    })    

    socket.on('sendMessage', (payload, callback = null) => { // Listening to Room

        //payloadType = {        
        //    message : {
        //        senderID: string | undefined,
        //        user: string,
        //        isUserSender: boolean,
        //        id: string,
        //        content: string,
        //        created_at: number,
        //        updated_at: number,
        //        room: string,
        //        isUserSender : string,
        //    }, 
        //    currentRoomUsers : number
        //}            

        const {message, currentRoomUsers} = payload
        const {senderID, ...messageRest} = message
        const typingUsersArray = Array.from(typingUsers)        
        
        const payloadRest = {
            message : messageRest,
            currentRoomUsers : currentRoomUsers
        }        

        const onlineUserId = onlineUsers.find((u) => u.id == senderID)
        
        if(!onlineUserId) {            
            const expirationTime = getExpirationTime()
            const connectingUser = {id : senderID, name : message.user, expirationTime : expirationTime}
            connectUser(connectingUser)
        }
        
        const inactiveUserId = inactiveUsers.findIndex((u) => u.id == senderID)        

        if(inactiveUserId > -1) {
            console.log(`${message.user} went active.`)
            inactiveUsers.splice(inactiveUserId, 1)
            inactiveUsersNames.splice(inactiveUserId, 1)
            socket.broadcast.emit(`updateInactive`, inactiveUsersNames)            
        }
        
        const updatedUserLists = {
            currentOnlineUsers : onlineUsers.length,
            currentInactiveUsers : inactiveUsers.length,               
            currentTypingUsers : typingUsersArray.length,
        }

        console.log(`${message.user} says "${message.content}".`)        
        
        if (callback != null) {
            callback({
                received : true,                
                ...updatedUserLists,
            })
        }

        const newPayload = {
            ...payloadRest,            
            ...updatedUserLists,
        }

        socket.broadcast.emit(`sendMessage`, newPayload)        

    })

    socket.on(`majorChange`, (message, callback = null) => { // Request reload

        // const socketPayload: Partial<{
        //     userId: string;
        //     userName: string;
        //     content: string;
        //     notification: string;
        //     roomName: string;
        //     roomId: string;
        //     notifyRoomOnly: boolean;
        // }>

        console.log(message?.notification ? message.notification : `Change notification : Failed`)
        if (callback != null) {
            callback(true)
        }
        socket.broadcast.emit(`majorChange`, message)
    })

    socket.on('minorChange', (message, callback = null) => { // No reload required
        // type TSocketPayload = {
        //     userId?: string | undefined;
        //     userName?: string | undefined;
        //     content?: string | undefined;
        //     notification?: string | undefined;
        //     roomName?: string | undefined;
        //     roomId?: string | undefined;
        //     notifyRoomOnly?: boolean | undefined;
        // }
        console.log(message.notification.trim().replace(/\s+/g, ' '))
        if (callback != null) {
            callback(onlineUsers.length)
        }
        socket.broadcast.emit(`minorChange`, message)
    })       

    socket.on('auth', (authRequest) => {

        try {

            const {user, isConnecting} = authRequest            
            const expirationTime = getExpirationTime()

            if (user?.id && isConnecting == true) {
                connectUser({...user, expirationTime : expirationTime})                
                socket.broadcast.emit(`auth`, onlineUsersNames)
                return
            }
            
            if (user?.id && isConnecting == false) {
                disconnectUser(user.id)
                socket.broadcast.emit(`auth`, onlineUsersNames)
                return
            }

        } catch (e) {
            console.log(`auth error`)
        }

    })

    socket.on(`updateTyping`, (payload) => { // {id : string, name : string, isTyping : boolean}
        try {
            const {id, name, isTyping} = payload
            console.log(`${name} has ${isTyping ? `started` : `stopped`} typing.`)
            if(isTyping) {
                typingUsers.add(id)
            } else {
                typingUsers.delete(id)
            }
            socket.broadcast.emit(`updateTyping`, payload)
        } catch (e) {
            console.log(`auth error`)
        }
    })

    socket.on(`authList`, (payload = null, callback = null) => {
        try {
            if(callback) {
                callback(onlineUsers)
            }
            io.to(socket.id).emit('auth', onlineUsersNames)
        } catch (e) {
            console.log(`error while updating list`)
        }
    })

    socket.on(`inactiveList`, (payload = null, callback = null) => {
       try {
            if(callback) {
                callback(inactiveUsers)
            }
            io.to(socket.id).emit(`updateInactive`, inactiveUsersNames)
        } catch (e) {
            console.log(`error while updating list`)
        }
    })

    socket.on(`typingList`, (payload = null, callback = null) => {
        try {
            const typingListArray = Array.from(typingUsers)
            if(callback) {
                callback(typingUsers)
            }
            io.to(socket.id).emit(`updateTyping`, typingListArray)
        } catch (e) {
            console.log(`error while updating list`)
        }
    })

})

io.listen(4000)
import { Server } from "socket.io";

const io = new Server({
    cors : {origin : 'http://localhost:5173'}
})

let onlineUsers = []
let onlineUsersNames = []
let inactiveUsers = []
let inactiveUsersNames = []
let nextExpirationCheck = -1

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

const connectUser = (user) => {
    
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

const disconnectUser = (userId) => {
    
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

    socket.on(`inactive`, (user) => {
                       
        const {id, name, inactive} = user

        console.log(`inactivity status change to ${inactive} for ${name}...`)

        if(!name || name == `` || name == null || !id || id == `none`) {
            console.log(`Unable change inactivity : Invalid name or id`)
            return
        }

        const onlineUser = onlineUsers.find((u) => u.id == id)

        if(!onlineUser) {
            console.log(`Unable change inactivity : Status user offline.`)
            return
        }

        const inactiveUserId = inactiveUsers.findIndex((u) => u.id == id)
                
        if (inactive == true) {
            if(inactiveUserId == -1) {
                console.log(`${name} went inactive.`)
                inactiveUsers.push({id : id, name : name, inactive : inactive})                
                inactiveUsersNames.push({id : id, name : name})
                socket.broadcast.emit(`inactive`, inactiveUsersNames)
            }
        } else {
            if(inactiveUserId > -1) {
                console.log(`${name} went active.`)
                inactiveUsers.splice(inactiveUserId, 1)
                inactiveUsersNames.splice(inactiveUserId, 1)
                socket.broadcast.emit(`inactive`, inactiveUsersNames)
            }
        }    

    })    

    socket.on('room', (payload, callback = null) => { // Listening to Room        

        const {message} = payload

        console.log(`${message.user} says "${message.content}".`)
        
        if (callback != null) {
            callback({
                received : true, 
                currentOnlineUsers : onlineUsers.length,
                currentInactiveUsers : inactiveUsers.length
            })
        }

        socket.broadcast.emit('room', {...payload, inactiveUsersLength : inactiveUsers.length})
        
        //io.emit(`room`. message)
        //io.to(socket.id).emit('room', messages) // Sends String, Objects etc...

    })

    socket.on('change', (message, callback = null) => {
        console.log(message)
        if (callback != null) {
            callback(true)
        }
        socket.broadcast.emit(`change`, message)
        //io.emit('change', message)
    })

    socket.on('minorChange', (message, callback = null) => { // content, notification, room (id) (change with no reload)
        console.log(message.notification.trim().replace(/\s+/g, ' '))
        if (callback != null) {
            callback(onlineUsers.length)
        }
        socket.broadcast.emit(`minorChange`, message)
        //io.emit('minorChange', message)
    })   

    socket.on('auth', (authRequest) => {

        try {

            const {user, isConnecting} = authRequest
            const dateNow = Date.now()
            const expirationTime = dateNow + (1000 * 60 * 15)

            if (user?.id && isConnecting == true) {
                connectUser({...user, expirationTime : expirationTime})
                return
            }
            
            if (user?.id && isConnecting == false) {
                disconnectUser(user.id)
                return
            }

        } catch (e) {
            console.log(`auth error`)
        }

    })

    socket.on(`onTyping`, (payload) => { // {id : string, name : string, isTyping : boolean}
        try {
            const {name, isTyping} = payload
            console.log(`${name} has ${isTyping ? `started` : `stopped`} typing.`)
            socket.broadcast.emit(`onTyping`, payload)            
        } catch (e) {
            console.log(`auth error`)
        }
    })

    socket.on(`authList`, () => {
        io.emit(`auth`, onlineUsersNames)
    })

    socket.on(`inactiveList`, () => {
        io.emit('inactive', inactiveUsersNames)
    })

})

io.listen(4000)
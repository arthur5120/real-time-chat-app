import { Server } from "socket.io";

const io = new Server({
    cors : {origin : 'http://localhost:5173'}
})

let onlineUsers = []
let onlineUsersNames = []
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
            onlineUsersNames = newList.map((user) => user.name)
        }
    }
    console.log(`Online : ${JSON.stringify(onlineUsersNames)}, next check in ${(((nextExpirationCheck - hereNow) / (1000 * 60)) | 0)}m.`)
}, 5000)

const connectUser = (user) => {
    
    try {        

        const isUserOnline = onlineUsers.find((u) => u.id == user.id)

        if (!isUserOnline) {                        
            onlineUsers.push(user)
            onlineUsersNames.push(user.name)
        }  
        
        const inactiveUserId = inactiveUsersNames.findIndex((u) => u == user.name)

        if(inactiveUserId > -1) {
            inactiveUsersNames.splice(inactiveUserId, 1)
        }

        console.log(`Connected : ${onlineUsers[onlineUsers.length - 1].id}`)

    } catch (e) {
        console.log(`Error while connecting : ${e}`)
    }
    
}

const disconnectUser = (userId) => {
    
   try {       

       const onlineUserId = onlineUsers.findIndex((u) => u.id == userId)
       const inactiveUserId = onlineUserId != -1 ?  
       inactiveUsersNames.findIndex((u) => u == onlineUsersNames[onlineUserId]) : -1

        if (onlineUserId != -1) {
            onlineUsers.splice(onlineUserId, 1)
            onlineUsersNames.splice(onlineUserId, 1)
        }

        if(inactiveUserId != -1) {
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
                       
        const {name, inactive} = user

        console.log(`inactivity status change to ${inactive} for ${name}...`)

        const inactiveUserId = inactiveUsersNames.findIndex((u) => u == name)
        
        if(!name || name == ``) {
            console.log(`invalid name`)
            return
        }

        if (inactive == true) {
            if(inactiveUserId == -1) {                
                console.log(`${name} went inactive.`)
                inactiveUsersNames.push(name)
                socket.broadcast.emit(`inactive`, inactiveUsersNames)
                //io.emit('inactive', inactiveUsersNames)
            }
        } else {
            if(inactiveUserId > -1) {                
                console.log(`${name} went active.`)
                inactiveUsersNames.splice(inactiveUserId, 1)
                socket.broadcast.emit(`inactive`, inactiveUsersNames)
                //io.emit('inactive', inactiveUsersNames)
            }
        }    

    })    

    socket.on('room', (message, callback = null) => { // Listening to Room

        console.log(`${message.user} says "${message.content}".`)
        
        if (callback != null) {
            callback(true)
        }

        socket.broadcast.emit('room', message)
        
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

    socket.on('messageChange', (message) => { // content, notification, room (id)
        console.log(message.notification.trim().replace(/\s+/g, ' '))
        socket.broadcast.emit(`messageChange`, message)
        //io.emit('messageChange', message)
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

    socket.on(`authList`, () => {
        io.emit(`auth`, onlineUsersNames)
        //socket.broadcast.emit(`auth`, onlineUsersNames)
    })

    socket.on(`inactiveList`, () => {
        io.emit('inactive', inactiveUsersNames)
        //socket.broadcast.emit(`inactive`, inactiveUsersNames)
    })
    
    socket.on(``, () => {
        
    })

})

io.listen(4000)
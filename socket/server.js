import { Server } from "socket.io";

const io = new Server({
    cors : {origin : 'http://localhost:5173'}
})

let onlineUsers = []
let onlineUsersNames = []
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

        console.log(`Connecting : ${user.id}`)
        const isUserOnline = onlineUsers.find((u) => u.id == user.id)

        if (!isUserOnline) {            
            onlineUsers.push(user)            
            onlineUsersNames.push(user.name)
        }

        console.log(`User added : ${onlineUsers[onlineUsers.length - 1].id}`)

    } catch (e) {
        console.log(`Error while connecting : ${e}`)
    }
    
}

const disconnectUser = (userId) => {
    
   try {
    
       console.log(`Disconnecting : ${userId}`)
       const onlineUserId = onlineUsers.findIndex((u) => u.id == userId)

        if (onlineUserId != -1) {
            onlineUsers.splice(onlineUserId, 1)
            onlineUsersNames.splice(onlineUserId, 1)
        }

        console.log(`User removed : ${userId}`)

   } catch (e) {
        console.log(`Error while disconnecting : ${e}`)
   }
}

io.on('connection', (socket) => {    

    socket.on('test', (message, callback = null) => {
        console.log(JSON.stringify(message))
        if (callback != null) {
            callback(true)
        }
        io.emit('change', message)
    })

    socket.on('room', (message, callback = null) => { // Listening to Room
        console.log(JSON.stringify(message))
        if (callback != null) {
            callback(true)
        }
        io.emit('room', message)
        //io.to(socket.id).emit('room', messages) // Sends String, Objects etc...
    })

    socket.on('change', (message, callback = null) => {
        console.log(JSON.stringify(message))
        if (callback != null) {
            callback(true)
        }
        io.emit('change', message)
    })

    socket.on('messageChange', (message) => {
        console.log(JSON.stringify(message))
        io.emit('messageChange', message)
    })

    socket.on('auth', (authRequest) => {   
        
        console.log(`got request.`)        

        try {

            const {user, isConnecting} = authRequest
            const dateNow = Date.now()
            const expirationTime = dateNow + (1000 * 60 * 15)

            if (user?.id && isConnecting == true) {                
                connectUser({...user, expirationTime : expirationTime})
                console.log(`connecting user : ${JSON.stringify(user)}`)
                return
            }
            
            if (user?.id && isConnecting == false) {
                disconnectUser(user.id)
                console.log(`disconnecting user : ${JSON.stringify(user)}`)
                return
            }

        } catch (e) {
            console.log(`auth error ${e}`)
        }

    })

    socket.on(`authList`, () => {
        io.emit(`auth`, onlineUsersNames)
    })

})

io.listen(4000)
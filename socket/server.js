import { Server } from "socket.io";

const io = new Server({
    cors : {origin : 'http://localhost:5173'}
})

let onlineUsers = []
let onlineUsersNames = []

setInterval(() => {
    console.log(`Currently Online : ${JSON.stringify(onlineUsersNames)}`)    
}, 5000)

const connectUser = (user) => {
    
    try {
        const isUserOnline = onlineUsers.find((u) => u.id == user.id)
        console.log(`is User in list already? ${isUserOnline} ${!isUserOnline}`)
        if (!isUserOnline) {            
            onlineUsers.push(user)            
            onlineUsersNames.push(user.name)
        }
        console.log(`Connecting : ${user.id}`)
        console.log(`User added : ${JSON.stringify(onlineUsers[onlineUsers.length - 1])}`)
    } catch (e) {
        console.log(`Error while connecting : ${e}`)
    }
    
}

const disconnectUser = (userId) => {
    
   try {
    
        const onlineUserId = onlineUsers.findIndex((u) => u.id == userId)

        console.log(`user found? ${onlineUserId} ${onlineUserId != -1}`)

        if (onlineUserId != -1) {
            onlineUsers.splice(onlineUserId, 1)
            onlineUsersNames.splice(onlineUserId, 1)
        }

        console.log(`Disconnecting : ${userId}`)

   } catch (e) {
        console.log(`Error while disconnecting : ${e}`)
   }
}

io.on('connection', (socket) => {   

    socket.on('room', (message) => { // Listening to Room
        console.log(JSON.stringify(message))
        io.emit('room', message)
        //io.to(socket.id).emit('room', messages) // Sends String, Objects etc...
    })

    socket.on('change', (message) => {
        console.log(JSON.stringify(message))
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
            const expirationTime = dateNow

            if (user?.id && isConnecting == true) {                
                //connectUser({...user, expirationTime : expirationTime})
                connectUser(user)
                return
            }
            
            if (user?.id && isConnecting == false) {
                disconnectUser(user.id)
                return
            }            

        } catch (e) {
            console.log(`auth error ${e}`)
        }

    })

    socket.on(`authList`, () => {
        console.log(`Yep.`)
        io.emit(`auth`, `OK`)
    })

})

io.listen(4000, () => {
    console.log(`Socket running on port : ${4000}`)
})
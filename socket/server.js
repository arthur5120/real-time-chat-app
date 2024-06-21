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
                connectUser({...user, expirationTime : expirationTime})                
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
        io.emit(`auth`, onlineUsersNames)
    })

})

io.listen(4000, () => {
    console.log(`Socket running on port : ${4000}`)
})
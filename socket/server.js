import { Server } from "socket.io";

const io = new Server({
    cors : {origin : 'http://localhost:5173'}
})

let onlineUsers = []
let onlineUsersNames = []

setInterval(() => {
    console.log('Disconnecting Users')    
}, 15000)

const connectUser = (user) => {
    const isUserOnline = onlineUsers.find((u) => u.id == user.id)
    if (!isUserOnline) {
        onlineUsers.push(user)
        onlineUsersNames.push(user.name)
    }
}

const disconnectUser = (userId) => {
    const onlineUserId = onlineUsers.findIndex((u) => u.id == userId)
    onlineUsers.splice(onlineUserId, 1)
    onlineUsersNames.splice(onlineUserId, 1)
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

        try {

            const {user, isConnecting} = authRequest
            const dateNow = Date.now()
            const expirationTime = dateNow + 15000

            if (isConnecting == true) {
                connectUser({...user, expirationTime})
                io.emit(`auth`, onlineUsersNames)
                console.log(`connecting`)
            } else if (isConnecting == false) {
                console.log(`trying to disconnect`)
                console.log(JSON.stringify(user))
                disconnectUser(user.id)
                io.emit(`auth`, onlineUsersNames)
                console.log(`disconnecting`)
            } else {                 
                console.log(`exception`)
            }

        } catch (e) {
            console.log(`auth error ${e}`)
        }

    })

})

io.listen(4000, () => {
    console.log(`Socket running on port : ${4000}`)
})
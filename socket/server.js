import { Server } from "socket.io";

const io = new Server({
    cors : {origin : 'http://localhost:5173'}
})

let onlineUsers = []

const connectUser = (user) => {
    const onlineUser = onlineUsers.find(user.id)
    if (!onlineUser) {
        onlineUser.push(user)
    }
}

const disconnectUser = (user) => {
    const onlineUserId = onlineuser.indexOf(user)
    user.splice(onlineUserId, 1)
}

io.on('connection', (socket) => {

    socket.on('room', (message) => { // Listening to Room

        console.log(JSON.stringify(message))
        io.emit('room', message)

        //io.to(socket.id).emit('room', messages) // Sends String, Objects etc...
        
    })
})

io.listen(4000, () => {
    console.log(`Socket running on port : ${4000}`)
})
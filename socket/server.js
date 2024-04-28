import { Server } from "socket.io";

const io = new Server({
    cors : {origin : 'http://localhost:5173'}
})

io.on('connection', (socket) => {
    socket.on('room', (receivedMessage) => { // Listeing to Room
        console.log(receivedMessage)
        io.to(socket.id).emit('room', 'message.') // Sends String, Objects etc...
    })
})

io.listen(4000)
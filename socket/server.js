import { Server } from "socket.io";

const io = new Server({
    cors : {origin : 'http://localhost:5173'}
})

let messages = []

io.on('connection', (socket) => {

    socket.on('room', (receivedMessages) => { // Listening to Room 

        if(receivedMessages[0] != undefined) { 
            messages = receivedMessages
        } else {
            messages.push(receivedMessages)
        }
        
        console.log(`Messages received : ${messages?.length}`)
        //io.to(socket.id).emit('room', messages) // Sends String, Objects etc...
        io.emit('room', messages)
        
    })
})

io.listen(4000, () => {
    console.log(`Socket running on port : ${4000}`)
})
import { Server } from "socket.io";

const io = new Server({
    cors : {origin : 'http://localhost:5173'}
})

let savedMessages = []

io.on('connection', (socket) => {

    socket.on('room', (receivedMessages) => { // Listening to Room 

        const {room, messages} = receivedMessages  

        if(messages[0] != undefined) { 
            savedMessages = messages
        } else {
            savedMessages.push(messages)
        }        
        
        console.log(`Messages received : ${savedMessages?.length} emitting to ${room}`)

        //io.to(socket.id).emit('room', messages) // Sends String, Objects etc...       

        io.emit(room, {room : room, messages : savedMessages})
        
    })
})

io.listen(4000, () => {
    console.log(`Socket running on port : ${4000}`)
})
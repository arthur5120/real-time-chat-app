import { Server } from "socket.io";

const io = new Server({
    cors : {origin : 'http://localhost:5173'}
})

let savedMessages = []

io.on('connection', (socket) => {

    socket.on('room', ({room, messages}) => { // Listening to Room         

        if(messages != '' && room != '0') {
            savedMessages.push(messages)
        } else {
            return
        }    
        
        console.log(`Messages received : ${savedMessages?.length} emitting to ${room}`)

        const filteredMessages = savedMessages.filter(message => message.room == room)

        //io.to(socket.id).emit('room', messages) // Sends String, Objects etc...       

        io.emit(room, {room : room, messages : filteredMessages})        
        
    })
})

io.listen(4000, () => {
    console.log(`Socket running on port : ${4000}`)
})
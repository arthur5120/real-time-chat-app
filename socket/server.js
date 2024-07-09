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
    
    socket?.on(`disconnect`, (reason) => {      
        if (reason == `client namespace disconnect`) {
            //console.log(`scheduled disconnect`)
        } else {
            //console.log(`id : ${socket.id}, reason : ${reason}`)
        }
    })

    socket.on(`inactive`, (user) => { 
                       
        const {name, inactive} = user
        const inactiveUserId = inactiveUsersNames.findIndex((u) => u == name)
        
        if(!name || name == ``) {
            return
        }

        if (inactive == true) {
            if(inactiveUserId == -1) {                
                console.log(`${name} went inactive.`)
                inactiveUsersNames.push(name)                
                io.emit('inactive', inactiveUsersNames)
            }
        } else {
            if(inactiveUserId > -1) {                
                console.log(`${name} went active.`)
                inactiveUsersNames.splice(inactiveUserId, 1)                
                io.emit('inactive', inactiveUsersNames)
            }
        }    

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
import { useContext, useState, useEffect } from "react"
import { socketContext } from "./SocketProvider"

const App = () => {

  const socket = useContext(socketContext)
  const [messages, setMessages] = useState<string[]>(['...'])

  const sendMessage = async () => {
    socket?.emit('room', 'hi from client')
  }

  useEffect(() => {      

    socket?.on('room', (newMsg : string) => {               
      setMessages([...messages, newMsg])
    })

    return () => {
      socket?.off()
    }    

  }, [socket, messages.length])

  return (    
    <>      

      <select name="" id="">
        {messages.map(msg => <option>{msg}</option>)}
      </select>

      <button onClick={() => sendMessage()}>Click</button>      

    </>    
  )

}

export default App

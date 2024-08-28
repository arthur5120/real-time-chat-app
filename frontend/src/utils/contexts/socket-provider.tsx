import { useEffect, useState, createContext, ReactNode, FC } from "react"
import io, { Socket } from 'socket.io-client'

export const socketContext = createContext<Socket | null>(null)

export const SocketProvider : FC<{children : ReactNode}> = ({children}) => {
  
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    setSocket(io('http://localhost:4000'))    
  },[])
    
  return (
    <socketContext.Provider value={socket}>
      {children}
    </socketContext.Provider>
  )
  
}

export default SocketProvider

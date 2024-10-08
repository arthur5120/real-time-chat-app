import { useContext, useEffect, useRef } from "react"
import { authContext } from "../../utils/contexts/auth-provider"
import { toastContext } from "../../utils/contexts/toast-provider"
import CustomTitle from "../atoms/title"
import Chat from "./chat"


const ChatRooms = () => {
  
  const {auth} = useContext(authContext)
  const {notifyUser} = useContext(toastContext)
  const hasRunOnce = useRef(false)  

  useEffect(() => {
    if(!auth && !hasRunOnce.current) {
      notifyUser(`Read only permissions, not authenticated.`, `warning`)   
      hasRunOnce.current = true      
    }
  }, [])

  return (

    <>

      <CustomTitle value='Chat Rooms' className='text-blue-500 my-3'/>
      
      <Chat/>
      
    </>

  )

}


export default ChatRooms

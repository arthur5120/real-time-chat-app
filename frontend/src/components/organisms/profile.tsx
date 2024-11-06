import { authStatus, getUserById, getChatsByUserId, getMessageByUserId } from "../../utils/axios-functions"
import { authContext } from "../../utils/contexts/auth-provider"
import CustomTitle from "../atoms/title"
import { useContext, useEffect, useState } from "react"
import { TUser } from "../../utils/types"
import { toastContext } from "../../utils/contexts/toast-provider"
import { healthContext } from "../../utils/contexts/health-provider"

const Profile = () => {

    const {auth} = useContext(authContext)
    const {notifyUser} = useContext(toastContext)
    const {serverStatus} = useContext(healthContext)
    const [user, setUser] = useState<TUser>({})
    const [chatsCounter, setChatsCounter] = useState(0)
    const [messagesCounter, setMessagesCounter] = useState(0)
    const [hasToken, setHasToken] = useState(true)
    

    const handleStart = async () => {  
        
        try {
        
            const userAuthInfo = await authStatus({}) as {id : string, authenticated : boolean}
            const foundToken = userAuthInfo ? userAuthInfo.authenticated : false            

            if(!foundToken) {
                setHasToken(false)
                return
            } else if(!hasToken) {
                setHasToken(true)
            }

            const currentUser = await getUserById(userAuthInfo.id)     
            const chats = await getChatsByUserId(userAuthInfo.id)
            const messages = await getMessageByUserId(userAuthInfo.id)
            
            setChatsCounter(chats.length)
            setMessagesCounter(messages.length)
            setUser(currentUser)

        } catch (e) {         
            notifyUser(`Something Went Wrong`,`error`)
            console.log(e)
        }
    }
    
    useEffect(() => {              
        const delay = setTimeout(() => {
            handleStart()
        }, 200)
        return () => {
            clearTimeout(delay)
        }
    }, [auth, location])

    return (

      <section className='flex flex-col justify-center items-center text-center my-auto'>
        
        <CustomTitle value='Current Profile' className='text-green-500 my-3'/>

        {
            auth && hasToken && serverStatus ? 
                <h3>
                  Name : {user.name} <br/>
                  Email : {user.email} <br/>
                  Username : {user.username} <br/>
                  Role : {user.role} <br/>  
                  Active Chats : {chatsCounter} <br/>        
                  Messages Sent : {messagesCounter} <br/>  
                  Account Creation Date : {user.created_at} <br/>
                  Auth Status : {`${auth}`} <br/>
                </h3> : 
                <h3>
                    Not Authenticated/Authorized
                </h3>
        }

      </section>

    )

}

export default Profile

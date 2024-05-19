import { authStatus, getUserById } from "../../hooks/useAxios"
import { authContext } from "../../utils/contexts/auth-provider"
import CustomTitle from "../atoms/title"
import { useContext, useEffect, useState } from "react"
import { TUser } from "../../utils/types"
import { toastContext } from "../../utils/contexts/toast-provider"

const Profile = () => {

    const {auth} = useContext(authContext)
    const {notifyUser} = useContext(toastContext)
    const [user, setUser] = useState<TUser>({})

    const getUserInfo = async () => {
        try {
            const userAuthInfo = await authStatus({}) as {id : string}
            const currentUser = await getUserById(userAuthInfo.id)          
            setUser(currentUser)
        } catch (e) {           
            notifyUser(`Something Went Wrong`,`error`)
        }
    }
    
    useEffect(() => {
        getUserInfo()
    }, [])

    return (

      <section className='flex flex-col justify-center items-center text-center my-auto'>
        
        <CustomTitle value='Current Profile' className='text-blue-500 my-3'/>

        {
            auth ? 
                <h3>
                  Name : {user.name} <br/>
                  Email : {user.email} <br/>
                  Username : {user.username} <br/>
                  Role : {user.role} <br/>        
                </h3> : 
                <h3>
                    Not Authenticated/Authorized
                </h3>
        }

      </section>

    )

}

export default Profile

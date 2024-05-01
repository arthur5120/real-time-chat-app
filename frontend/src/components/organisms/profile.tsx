import { useContext } from "react"
import { authContext } from "../../utils/auth-provider"
import CustomTitle from "../atoms/title"
import Chat from "../molecules/chat"

const Profile = () => {

  const {auth, role} = useContext(authContext)

  return (

    <>

      <CustomTitle value='Profile Page'/>      

      <div className='flex flex-col justify-center items-center m-2 p-5'>
        {auth ? role == 'Admin' ? 'Full Access Granted' : 'Limited Access Granted' : 'Access Restricted'}
      </div>

      <Chat/>
      
    </>

  )

}


export default Profile

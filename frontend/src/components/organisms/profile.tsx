import { useContext } from "react"
import CustomTitle from "../atoms/title"
import Chat from "../molecules/chat"
import { authContext } from "../../utils/auth-provider"


const Profile = () => {

  const {auth} = useContext(authContext)

  return (

    <>

      <CustomTitle value='Profile Page' className='text-blue-500 my-3'/>

      {auth ? <Chat/> : <CustomTitle value='Not Authenticated/Authorized' className='m-5'/>}
      
    </>

  )

}


export default Profile

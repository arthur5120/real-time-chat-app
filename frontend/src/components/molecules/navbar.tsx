import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { authContext } from '../../utils/contexts/auth-provider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faComment, faSignIn, faSignOut } from '@fortawesome/free-solid-svg-icons'

//import { authLogout } from '../../hooks/useAxios'

const LinkStyle = `flex flex-col gap-1 bg-slate-900 text-white rounded-xl p-3 my-2 active:bg-black`

const Navbar = () => {

  const {auth, setAuth} = useContext(authContext)    

  const logout = async () => {    
    if (setAuth) {
      setAuth(false)
      //await authLogout({})
    }
  }

  return (

    <nav>

      <ul className='flex gap-4 items-center justify-center'>

          <li>
            <Link className={LinkStyle} to='/chat-rooms'>
              <FontAwesomeIcon icon={faComment} /> Chats
            </Link>
          </li>

          {
            auth ? 
              <li>
                <Link className={LinkStyle} to='/profile'>
                  <FontAwesomeIcon icon={faUser} /> Profile
                </Link>
              </li> : 
              <li>
                <Link className={LinkStyle} to='/create-account'>
                  <FontAwesomeIcon icon={faUser} /> Sign Up
                </Link>
              </li>
          }

          {
            auth ? 
              <li>                
                <Link className={LinkStyle} to={`/login`} onClick={async () => logout()}>
                  <FontAwesomeIcon icon={faSignOut} /> Sign out
                </Link>              
              </li> : 
              <li>
                <Link className={LinkStyle} to='/login'>              
                  <FontAwesomeIcon icon={faSignIn} /> Sign in
                </Link>
              </li> 
          }

      </ul>      
      
    </nav>

  )

}

export default Navbar

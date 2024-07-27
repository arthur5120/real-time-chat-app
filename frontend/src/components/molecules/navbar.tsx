import { useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authContext } from '../../utils/contexts/auth-provider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faComment, faSignIn, faSignOut } from '@fortawesome/free-solid-svg-icons'
import { authLogout } from '../../hooks/useAxios'

const LinkStyle = `flex flex-col gap-1 bg-slate-900 text-white rounded-xl p-3 my-2 active:bg-black select-none`

const Navbar = () => {

  const location = useLocation()
  const navigate = useNavigate()

  const {auth, setRole, setAuth} = useContext(authContext)    

  const logout = async () => {     
    setRole ? setRole('none') : ''
    setAuth ? setAuth(false) : ''
    await authLogout({})
    navigate(`/login`)    
  }

  return (

    <nav>

      <ul className='flex gap-4 items-center justify-center'>

          <li>
            <Link className={LinkStyle} to='/chat-rooms' draggable={false}>
              <FontAwesomeIcon icon={faComment} /> Chats
            </Link>
          </li>

          {
            auth ? 
              <li>
                <Link className={LinkStyle} to='/profile' draggable={false}>
                  <FontAwesomeIcon icon={faUser} /> Profile
                </Link>
              </li> : 
              <li>
                <Link className={LinkStyle} to='/create-account' draggable={false}>
                  <FontAwesomeIcon icon={faUser} /> Sign Up
                </Link>
              </li>
          }

          {
            auth ? 
              <li>                
                <Link className={LinkStyle} to={location.pathname} onClick={async () => logout()} draggable={false}>
                  <FontAwesomeIcon icon={faSignOut} /> Sign out
                </Link>              
              </li> : 
              <li>
                <Link className={LinkStyle} to='/login' draggable={false}>              
                  <FontAwesomeIcon icon={faSignIn} /> Sign in
                </Link>
              </li> 
          }

      </ul>      
      
    </nav>

  )

}

export default Navbar

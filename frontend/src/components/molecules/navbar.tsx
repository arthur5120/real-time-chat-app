import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { authContext, removeToken } from '../../utils/contexts/auth-provider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faComment, faSignIn, faSignOut } from '@fortawesome/free-solid-svg-icons'

const LinkStyle = `flex flex-col gap-1 bg-slate-900 text-white rounded-xl p-3 my-3`

const Navbar = () => {

  const {auth, setAuth} = useContext(authContext)  

  const logout = () => {
    if (setAuth) {
      removeToken(setAuth)      
    }
  }

  return (

    <nav>

      <ul className='flex gap-4 items-center justify-center'>

          <li><Link className={LinkStyle} to='/profile'>
            <FontAwesomeIcon icon={faComment} />
            Chat
          </Link></li>

          <li><Link className={LinkStyle} to='/create-account'>
            <FontAwesomeIcon icon={faUser} />
            Sign Up
          </Link></li>

          {
            auth ? 
            <li><Link className={LinkStyle} to='/login' onClick={() => logout()}>              
                <FontAwesomeIcon icon={faSignOut} />              
                Logout
            </Link></li> : 
            <li><Link className={LinkStyle} to='/login'>              
                <FontAwesomeIcon icon={faSignIn} />              
                Login
            </Link></li> 
          }

      </ul>
      
    </nav>

  )

}

export default Navbar

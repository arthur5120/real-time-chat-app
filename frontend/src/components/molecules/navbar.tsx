import { useContext } from "react"
import { Link } from "react-router-dom"
import { authContext, removeToken } from "../../utils/contexts/auth-provider"

const LinkStyle = `bg-slate-900 text-white rounded-xl p-3`

const Navbar = () => {

  const {auth, setAuth} = useContext(authContext)

  const logout = () => {
    if (setAuth) {
      removeToken(setAuth)      
    }
  }

  return (

    <nav>

      <ul className='flex gap-3 p-5 items-center justify-center'>
          <li><Link className={LinkStyle} to='/profile'>Profile</Link></li>
          <li><Link className={LinkStyle} to='/create-account'>Create Account</Link></li>
          {auth ? <li><Link className={LinkStyle} to='/login' onClick={() => logout()}>Logout</Link></li> : <li><Link className={LinkStyle} to='/login'>Login</Link></li> }
      </ul>
      
    </nav>

  )

}

export default Navbar

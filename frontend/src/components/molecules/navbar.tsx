import { Link } from "react-router-dom"

const LinkStyle = `bg-pink-500 rounded p-2`

const Navbar = () => {

  return (

    <nav>

      <ul className="flex gap-5 m-5 items-center justify-center">
          <li><Link className={LinkStyle} to='/profile'>Profile</Link></li>
          <li><Link className={LinkStyle} to='/create-account'>Create Account</Link></li>
          <li><Link className={LinkStyle} to='/login'>Login</Link></li>
      </ul>
      
    </nav>

  )

}

export default Navbar

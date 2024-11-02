import { 
  useState, 
  createContext, 
  FC, 
  ReactElement, 
  Dispatch, 
  SetStateAction,
  useEffect,  
} from 'react';

import { authStatus } from '../axios-functions';

type TAuth = Partial<{
  auth : boolean,
  setAuth : Dispatch<SetStateAction<boolean>>,
  role : string,
  setRole : Dispatch<SetStateAction<string>>,
  clickedToLogout : boolean,
  setClickedToLogout : Dispatch<SetStateAction<boolean>>,
  clickedToLogin : boolean,
  setClickedToLogin : Dispatch<SetStateAction<boolean>>,
  getAuthTokenStatus : Function,
  logout : Function,
}>

export const authContext = createContext<TAuth>({})

const AuthProvider : FC<{children : ReactElement}> = ({children}) => {
  
  const [auth, setAuth] = useState(false)
  const [role, setRole] = useState('none')
  const [clickedToLogout, setClickedToLogout] = useState(false)
  const [clickedToLogin, setClickedToLogin] = useState(false)

  const logout = async () => {
    setClickedToLogout(true)
    setRole ? setRole('none') : ''
    setAuth ? setAuth(false) : ''
  }

  const getAuthTokenStatus = async () => {    
    try {
      const {authenticated} = await authStatus({})
      return authenticated
    } catch(e) {
      return false
    }
  }

  const updateBannerRole = async () => {    
    if(auth) {
      const {role} = await authStatus({})
      setRole(role)
    } else {
      setRole(`none`)
    }
  }

  useEffect(() => { // Update the role
    updateBannerRole()
  }, [auth])

  return (
    <authContext.Provider value={{auth, setAuth, role, setRole, clickedToLogout, setClickedToLogout, clickedToLogin, setClickedToLogin, getAuthTokenStatus, logout}}>
      {children}
    </authContext.Provider>
  )

}

export default AuthProvider

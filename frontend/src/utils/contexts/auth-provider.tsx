import { 
  useState, 
  createContext, 
  FC, 
  ReactElement, 
  Dispatch, 
  SetStateAction,
  useEffect,  
} from 'react';

import { authStatus, getServerHealth } from '../axios-functions';

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
  currentAuthId : string,
  setCurrentAuthId : Dispatch<SetStateAction<string>>,
}>

export const authContext = createContext<TAuth>({})

const AuthProvider : FC<{children : ReactElement}> = ({children}) => {
  
  const [auth, setAuth] = useState(false)
  const [role, setRole] = useState('none')
  const [currentAuthId, setCurrentAuthId] = useState(``)
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
    try {
      const isServerRunning = await getServerHealth()
      if(isServerRunning) {
        if(auth) {
          const {role} = await authStatus({})
          setRole(role)
        } else {
          setRole(`none`)
        }
      }
    } catch(e) {
      console.log(`Error while changing auth banner role.`)
    }
  }

  useEffect(() => { // Update the role
    updateBannerRole()
  }, [auth])    

  return (
    <authContext.Provider value={{
      auth, setAuth, role, setRole, clickedToLogout, setClickedToLogout, 
      clickedToLogin, setClickedToLogin, getAuthTokenStatus, logout,
      currentAuthId, setCurrentAuthId,
    }}>
        {children}
    </authContext.Provider>
  )

}

export default AuthProvider

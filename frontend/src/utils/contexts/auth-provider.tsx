import { 
  useState, 
  createContext, 
  FC, 
  ReactElement, 
  Dispatch, 
  SetStateAction,
  useEffect,  
} from 'react';

import { authStatus } from '../../hooks/useAxios';

type TAuth = {
  auth ? : boolean,
  setAuth ? : Dispatch<SetStateAction<boolean>>
  role ? : string,
  setRole ? : Dispatch<SetStateAction<string>>
  userActivity ? : boolean,
  setUserActivity ? : Dispatch<SetStateAction<boolean>>,
  getAuthTokenStatus ? : Function
}

export const authContext = createContext<TAuth>({})

const AuthProvider : FC<{children : ReactElement}> = ({children}) => {  

  const [auth, setAuth] = useState(false)
  const [role, setRole] = useState('none')  
  const [userActivity, setUserActivity] = useState(true)

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
    <authContext.Provider value={{auth, setAuth, role, setRole, userActivity, setUserActivity, getAuthTokenStatus}}>
      {children}
    </authContext.Provider>
  )

}

export default AuthProvider

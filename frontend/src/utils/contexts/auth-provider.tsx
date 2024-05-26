import { 
  useState, 
  createContext, 
  FC, 
  ReactElement, 
  Dispatch, 
  SetStateAction,   
} from 'react';

import { authStatus, authLogout } from '../../hooks/useAxios';

type TAuth = {
  auth ? : boolean,
  setAuth ? : Dispatch<SetStateAction<boolean>>
  role ? : string,
  setRole ? : Dispatch<SetStateAction<string>>
  checkToken ? : Function
}

export const removeToken = async (setAuth : Dispatch<SetStateAction<boolean>>) => {  
  setAuth(false)
  await authLogout({})
}

export const authContext = createContext<TAuth>({})

const AuthProvider : FC<{children : ReactElement}> = ({children}) => {  

  const [auth, setAuth] = useState(false)
  const [role, setRole] = useState('none')  

  const checkToken = async () => {
    try {
      const {authenticated, role} = await authStatus({})
      setRole(role)
      setAuth(authenticated)
      return authenticated
    } catch(e) {
      setAuth(false)
      return false
    }
  }

  return (
    <authContext.Provider value={{auth, setAuth, role, setRole, checkToken}}>
      {children}
    </authContext.Provider>
  )

}

export default AuthProvider

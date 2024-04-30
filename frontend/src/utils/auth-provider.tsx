import { 
  useState, 
  createContext, 
  FC, 
  ReactElement, 
  Dispatch, 
  SetStateAction,   
  useEffect
} from 'react';

import { checkAuth, logout } from '../hooks/useAxios';

type TAuth = {
  auth ? : boolean,
  setAuth ? : Dispatch<SetStateAction<boolean>>
  role ? : string,
  setRole ? : Dispatch<SetStateAction<string>>
}

export const authContext = createContext<TAuth>({})

const AuthProvider : FC<{children : ReactElement}> = ({children}) => {  

  const [auth, setAuth] = useState(false)
  const [role, setRole] = useState('none')

  const removeToken = async () => {
    await logout({})
  }

  const checkToken = async () => {
    try {
      const {authenticated, role} = await checkAuth({})
      setRole(role)
      setAuth(authenticated)
    } catch(e) {
      setRole('none')
      setAuth(false)
    }
  }

  useEffect(() => {
    checkToken()
  }, [auth])

  return (

      <authContext.Provider value={{auth, setAuth, role, setRole}}>
        {children}
      </authContext.Provider>
  )

}

export default AuthProvider

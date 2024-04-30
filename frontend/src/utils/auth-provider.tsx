import { 
  useState, 
  createContext, 
  FC, 
  ReactElement, 
  Dispatch, 
  SetStateAction,   
  useEffect
} from 'react';

import Cookies from 'js-cookie';

type TAuth = {
  auth ? : boolean,
  setAuth ? : Dispatch<SetStateAction<boolean>>
}

export const authContext = createContext<TAuth>({})

const AuthProvider : FC<{children : ReactElement}> = ({children}) => {  

  const [auth, setAuth] = useState(false)

  const checkToken = () => {
    const hasCookie = !!Cookies.get('auth')    
    setAuth(hasCookie)
  }

  useEffect(() => {
    checkToken()
  }, [auth])

  return (

      <authContext.Provider value={{auth, setAuth}}>
        {children}
      </authContext.Provider>
  )

}

export default AuthProvider

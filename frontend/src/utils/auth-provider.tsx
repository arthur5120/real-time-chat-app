import { 
  useState, 
  createContext, 
  FC, 
  ReactElement, 
  Dispatch, 
  SetStateAction 
} from 'react';

type TAuth = {
  auth ? : boolean,
  setAuth ? : Dispatch<SetStateAction<boolean>>
}

export const authContext = createContext<TAuth>({})

const AuthProvider : FC<{children : ReactElement}> = ({children}) => {

  const [auth, setAuth] = useState(false)

  return (
    
      <authContext.Provider value={{auth, setAuth}}>
        {children}
      </authContext.Provider>
  )

}

export default AuthProvider

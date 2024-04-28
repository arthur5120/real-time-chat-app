import { useState, createContext, FC, ReactElement } from "react";

type TAuth = {
  auth ? : boolean,
  setAuth ? : React.Dispatch<React.SetStateAction<boolean>>
} | null

export const authContext = createContext<TAuth>(null)

const AuthProvider : FC<{children : ReactElement}> = ({children}) => {

  const [auth, setAuth] = useState(false)

  return (
    
      <authContext.Provider value={{auth, setAuth}}>
        {children}
      </authContext.Provider>
  )

}

export default AuthProvider

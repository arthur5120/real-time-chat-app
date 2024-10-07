import { useEffect, useState, createContext, ReactNode, FC, Dispatch } from "react"
import { getServerHealth } from "../axios-functions"

type THealthContext = Partial<{
    serverStatus : boolean,
    setServerStatus : Dispatch<React.SetStateAction<boolean>>,
    updateServerStatus : Function,
}>

export const healthContext = createContext<THealthContext>({})

export const HealthProvider : FC<{children : ReactNode}> = ({children}) => {
  
    const [serverStatus, setServerStatus] = useState<boolean>(false)

    const updateServerStatus = async () => {
        try {
            const res = await getServerHealth()
            const isServerRunning = res?.status
            setServerStatus(isServerRunning)
            return isServerRunning
        } catch (e) {
            console.error(`Error fetching server health`, e)
            setServerStatus(false)
            return false
        }
    }

    useEffect(() => {        
        updateServerStatus()
    },[])
    
    return (
        <healthContext.Provider value={{serverStatus, setServerStatus, updateServerStatus}}>
            {children}
        </healthContext.Provider>
    )
  
}

export default HealthProvider

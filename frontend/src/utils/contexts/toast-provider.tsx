import { ToastContainer, toast } from "react-toastify"
import { TypeOptions } from "react-toastify"
import { ReactElement, createContext, FC } from "react"

import "react-toastify/ReactToastify.css"

type TToast = {
  notifyUser : Function
}

export const toastContext = createContext<TToast>({notifyUser : () => alert()}) 

export const ToastProvider : FC<{children : ReactElement}> =({children}) => {   
  
  const notifyUser = (notification : string, type : TypeOptions = 'info') => toast.info(notification, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    className : 'bg-slate-800',
    type : type,
  })

  return (
    <>    

    <toastContext.Provider value={{notifyUser}}>

      {children}

      <ToastContainer      
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
      /> 

    </toastContext.Provider>

    </>
  )
}

export default ToastProvider

import { baseURL } from "./axios-instance";
import { TUser } from "./types";
import { generateUniqueId, getConfig } from "./useful-functions";
import axios from 'axios'

export const createUser = async(data : TUser) => { // Idempotency
    try {        
        const optimisticId = generateUniqueId()
        const config = getConfig(optimisticId)
        const res = await baseURL.post(`/create-user`, data, config)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const updateUser = async(id : string) => {
    try {
        const res = await baseURL.put(`/update-user/${id}`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const deleteUser = async(id : string) => {
    try {
        const res = await baseURL.delete(`/delete-user/${id}`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const getUsers = async() => {
    try {
        const res = await baseURL.get(`/users`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const getUserById = async(id : string) => {
    try {
        const res = await baseURL.get(`/users/${id}`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const authLogin = async(data : TUser) => {
    try {
        const res = await baseURL.post(`/auth`, data)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const authLogout = async(data : any) => {
    try {
        const res = await baseURL.post(`/logout`, data)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const authStatus = async(data : any) => {
    try {
        const res = await baseURL.post(`/get-auth`, data)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const createChat = async () => { // Idempotency            
    try {
        const timeNow = Date.now()
        const timeBoundUniqueId = Math.floor(timeNow / (6000)) // Requests within a five seconds interval will be considered the same one.
        const config = getConfig(`${timeBoundUniqueId}`)
        const res = await baseURL.post(`create-chat`, {}, config)
        return res.data
    } catch (e) {              
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }  
}

export const deleteChat = async (chatId : string) => {
    try {
        const res = await baseURL.delete(`delete-chat/${chatId}`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const deleteAllChats = async () => {
    try {
        const res = await baseURL.delete(`delete-all-chats`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const addUserToChat = async(userId : string, chatId : string) => {
   try {
        const data = {userId : userId}
        const res = await baseURL.post(`/add-user-to-chat/${chatId}`, data)
        return res.data
   } catch (e) {

   }
} 

export const removeUserFromChat = async(userId : string, chatId : string) => {
    try {
        const data = {userId : userId}
        const res = await baseURL.delete(`/remove-user-from-chat/${chatId}`, {data : data})
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const getChats = async() => {
    try {
        const res = await baseURL.get(`/chats`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const getChatById = async(id : string) => {
    try {
        const res = await baseURL.get(`/chats/${id}`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const getChatsByUserId = async (userId : string) => {
    try {        
        const res = await baseURL.get(`users/${userId}/chats`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const getUsersByChatId = async (chatId : string) => {
    try {        
        const res = await baseURL.get(`chats/${chatId}/users`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const createMessage = async(senderId : string, chatId : string, content : string, senderName : string = 'Unknown') => { // Idempotency

    try {
        
        const optimisticId = generateUniqueId()
        const config = getConfig(optimisticId)

        const data = {
            chatId : chatId,
            content : content,
            senderId : senderId,
            senderName : senderName
        }

        const res = await baseURL.post(`/create-message`, data, config)    
        return res.data
        
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
 
}

export const updateMessage = async(messageId : string, content : string) => {

    try {
        const data = {
            content : content,
        }
    
        const res = await baseURL.put(`/update-message/${messageId}`, data)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
 
}

export const deleteMessage = async(messageId : string) => {    
    try {
        const res = await baseURL.delete(`/delete-message/${messageId}`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const getMessages = async() => {
    try {
        const res = await baseURL.get(`messages`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const getMessageById = async (messageId : string) => {
    try {
        const res = await baseURL.get(`messages/${messageId}`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const getMessageByUserId = async (userId : string) => {
    try {
        const res = await baseURL.get(`users/${userId}/messages`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const getCSRFToken = async () => {
    try {
        const res = await baseURL.get(`get-csrf-token`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}

export const setAxiosCSRFToken = async (csrfToken : string) => {
    baseURL.defaults.headers.common['X-CSRF-Token'] = csrfToken    
}

export const getServerHealth = async () => {    
    try {
        const res = await baseURL.get(`check-health`)
        return res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status) {
            return e.response.data
        }
    }
}
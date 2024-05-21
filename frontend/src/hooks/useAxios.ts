import { baseURL } from "../utils/axios-instance";
import { TUser } from "../utils/types";

export const createUser = async(data : TUser) => {
    const res = await baseURL.post(`/create-user`, data)
    return res.data
}

export const updateUser = async(id : string) => {
    const res = await baseURL.put(`/update-user/${id}`)
    return res.data
}

export const deleteUser = async(id : string) => {
    const res = await baseURL.delete(`/delete-user/${id}`)
    return res.data
}

export const getUsers = async() => {
    const res = await baseURL.get(`/users`)
    return res.data
}

export const getUserById = async(id : string) => {
    const res = await baseURL.get(`/users/${id}`)
    return res.data
}

export const authLogin = async(data : TUser) => {
    const res = await baseURL.post(`/auth`, data)
    return res.data
}

export const authLogout = async(data : any) => {
    const res = await baseURL.post(`/logout`, data)
    return res.data
}

export const authStatus = async(data : any) => {
    const res = await baseURL.post(`/get-auth`, data)
    return res.data
}

export const createChat = async () => {
    const res = await baseURL.post(`create-chat`)
    return res.data
}

export const deleteChat = async (chatId : string) => {
    const res = await baseURL.delete(`delete-chat/${chatId}`)
    return res.data
}

export const addUserToChat = async(userId : string, chatId : string) => {
    const data = {userId : userId}
    const res = await baseURL.post(`/add-user-to-chat/${chatId}`, data)
    return res.data
}

export const removeUserFromChat = async(userId : string, chatId : string) => {
    const data = {userId : userId}
    const res = await baseURL.delete(`/remove-user-from-chat/${chatId}`, {data : data})
    return res.data
}

export const getChats = async() => {
    const res = await baseURL.get(`/chats`)
    return res.data
}

export const getChatById = async(id : string) => {
    const res = await baseURL.get(`/chats/${id}`)
    return res.data
}

export const getChatsByUserId = async (userId : string) => {
    const res = await baseURL.get(`users/${userId}/chats`)
    return res.data
}

export const createMessage = async(senderId : string, chatId : string, content : string, senderName : string = 'Unknown') => {

    const data = {
        chatId : chatId,
        content : content,
        senderId : senderId,
        senderName : senderName
    }

    const res = await baseURL.post(`/create-message`, data)
    return res.data
 
}

export const updateMessage = async(messageId : string, content : string) => {

    const data = {
        content : content,
    }

    const res = await baseURL.put(`/update-message/${messageId}`, data)
    return res.data
 
}

export const deleteMessage = async(messageId : string) => {    
    const res = await baseURL.delete(`/delete-message/${messageId}`)
    return res.data
}

export const getMessages = async() => {
    const res = await baseURL.get(`messages`)
    return res.data
}

export const getMessageById = async (messageId : string) => {
    const res = await baseURL.get(`messages/${messageId}`)
    return res.data
}

export const getMessageByUserId = async (userId : string) => {
    const res = await baseURL.get(`users/${userId}/messages`)
    return res.data
}
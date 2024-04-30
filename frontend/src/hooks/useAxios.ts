import { baseURL } from "../utils/axios-instance";
import { TUser } from "../utils/types";

export const getUsers = async() => {
    const res = await baseURL.get(`/get-users`)
    return res.data
}

export const getUserById = async(id : string) => {
    const res = await baseURL.get(`/get-user/${id}`)
    return res.data
}

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

export const authUser = async(data : TUser) => {
    const res = await baseURL.post(`/auth`, data)
    return res.data
}

export const checkAuth = async(data : any) => {
    const res = await baseURL.post(`/get-auth`, data)
    return res.data
}

export const logout = async(data : any) => {
    const res = await baseURL.post(`/logout`, data)
    return res.data
}
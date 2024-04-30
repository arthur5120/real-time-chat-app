import axios from 'axios'

export const baseURL = axios.create({
    baseURL : 'http://localhost:3000',
    //withCredentials : true
})
import axios from 'axios'
import { generateUniqueId } from './useful-functions'

export const baseURL = axios.create({
    baseURL : 'http://localhost:3000',
    withCredentials : true
})

baseURL.interceptors.request.use(config => {    
    if (config.method === 'post' && !config.headers['Idempotency-Key']) {
        const idempotencyKey = generateUniqueId()        
        config.headers['Idempotency-Key'] = idempotencyKey
    }
    return config
}, error => {
    return Promise.reject(error)
})
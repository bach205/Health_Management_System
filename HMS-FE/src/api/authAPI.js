import {api} from './index.js'

const baseUrl = '/auth'

export const register = async (body) => {
    return await api.post(`${baseUrl}/register`, body);
}

export const login = async (body) => {
    return await api.post(`${baseUrl}/login`, body);
}

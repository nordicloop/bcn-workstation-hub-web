import type { Property } from '@bcn/core'
import axios from 'axios'

const client = axios.create({
    baseURL: 'http://localhost:3000'
})

export async function getProperties(): Promise<Property[]> {
    const response = await client.get('/properties')
    return response.data
}

export async function getProperty(id: string): Promise<Property> {
    const response = await client.get(`/properties/${id}`)
    return response.data
}

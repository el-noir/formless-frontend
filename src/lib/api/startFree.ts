'use client';
import { API_BASE_URL } from "./config";
import axios from "axios";

export async function checkFree(url: string) {
    try {
        const response = await axios.post(`${API_BASE_URL}/schema/extract`, { url }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
}
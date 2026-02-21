import { API_BASE_URL } from "./config";
import { useAuthStore } from "@/stores/authStore";

const getAuthHeaders = () => {
    const token = useAuthStore.getState().accessToken;
    return {
        Authorization: `Bearer ${token}`,
    };
};

export const getForms = async () => {
    const response = await fetch(`${API_BASE_URL}/forms`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        throw new Error("Failed to fetch forms");
    }
    const data = await response.json();
    return data.forms || [];
};

export const getForm = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/forms/${id}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        throw new Error("Failed to fetch form details");
    }
    const data = await response.json();
    return data.data;
};

export const deleteForm = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/forms/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        throw new Error("Failed to delete form");
    }
    return response.json();
};

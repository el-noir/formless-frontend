import { API_BASE_URL } from "./config";
import { useAuthStore } from "@/stores/authStore";

const getAuthHeaders = (): Record<string, string> => {
    const token = useAuthStore.getState().accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getIntegrationsGoogleAuthUrl = () => {
    return `${API_BASE_URL}/integrations/google/auth`;
};

export const getGoogleForms = async () => {
    const response = await fetch(`${API_BASE_URL}/integrations/google/forms`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, ...errorData };
    }

    return response.json();
};

export const getGoogleFormSchema = async (formId: string) => {
    const response = await fetch(`${API_BASE_URL}/integrations/google/forms/${formId}/schema`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, ...errorData };
    }

    return response.json();
};

export const watchGoogleForm = async (formId: string, mappingData: any) => {
    const response = await fetch(`${API_BASE_URL}/integrations/google/forms/${formId}/watch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(mappingData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, ...errorData };
    }

    return response.json();
};

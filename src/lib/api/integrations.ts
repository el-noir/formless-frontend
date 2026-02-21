import { apiFetch } from "./apiFetch";
import { API_BASE_URL } from "./config";

export const getIntegrationsGoogleAuthUrl = () => {
    return `${API_BASE_URL}/integrations/google/auth`;
};

export const getGoogleForms = async () => {
    const response = await apiFetch('/integrations/google/forms');

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, ...errorData };
    }

    return response.json();
};

export const getGoogleFormSchema = async (formId: string) => {
    const response = await apiFetch(`/integrations/google/forms/${formId}/schema`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, ...errorData };
    }

    return response.json();
};

export const watchGoogleForm = async (formId: string, mappingData: any) => {
    const response = await apiFetch(`/integrations/google/forms/${formId}/watch`, {
        method: 'POST',
        body: JSON.stringify(mappingData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, ...errorData };
    }

    return response.json();
};

export const importGoogleForm = async (formId: string) => {
    const response = await apiFetch('/forms/import', {
        method: 'POST',
        body: JSON.stringify({ formIdOrUrl: formId })
    });

    if (!response.ok) {
        let errorMsg = "Failed to import form";
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (e) { }
        throw new Error(errorMsg);
    }

    return response.json();
};

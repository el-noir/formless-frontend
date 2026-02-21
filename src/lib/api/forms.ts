import { apiFetch } from "./apiFetch";

export const getForms = async () => {
    const response = await apiFetch('/forms');
    if (!response.ok) {
        throw new Error("Failed to fetch forms");
    }
    const data = await response.json();
    return data.forms || [];
};

export const getForm = async (id: string) => {
    const response = await apiFetch(`/forms/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch form details");
    }
    const data = await response.json();
    return data.data;
};

export const deleteForm = async (id: string) => {
    const response = await apiFetch(`/forms/${id}`, { method: 'DELETE' });
    if (!response.ok) {
        throw new Error("Failed to delete form");
    }
    return response.json();
};

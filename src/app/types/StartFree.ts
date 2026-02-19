export interface StartFreeResponse {
    success: boolean;
    message: string;
    data?: {
        extractedData: any; // Replace with actual type if known
    };
}

export interface CheckFree{
    url: string;
}
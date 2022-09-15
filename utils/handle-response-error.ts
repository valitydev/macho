export async function handleResponseError(res: Response, xRequestID?: string): Promise<any> {
    let message = null;
    try {
        message = await res.json();
    } catch (e) {}
    const error = {
        xRequestID,
        status: res.status,
        statusText: res.statusText,
        url: res.url,
        message
    };
    throw error;
}

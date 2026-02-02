const BASE_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    // If not JSON (e.g. HTML error page), return text so caller can handle/error
    return response.text();
};

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: { ...getAuthHeader() },
        });
        const data = await parseResponse(response);
        if (!response.ok) {
            const message = typeof data === 'string' ? data : data.message;
            throw new Error(message || 'Something went wrong');
        }
        return data;
    },
    post: async (endpoint, body, options = {}) => {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        const headers = { ...getAuthHeader(), ...(options.headers || {}) };
        // If sending FormData, let browser set Content-Type (including boundary)
        if (!isFormData && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: isFormData ? body : JSON.stringify(body),
        });
        const data = await parseResponse(response);
        if (!response.ok) {
            const message = typeof data === 'string' ? data : data.message;
            throw new Error(message || 'Something went wrong');
        }
        return data;
    },
    put: async (endpoint, body, options = {}) => {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        const headers = { ...getAuthHeader(), ...(options.headers || {}) };
        if (!isFormData && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: isFormData ? body : JSON.stringify(body),
        });
        const data = await parseResponse(response);
        if (!response.ok) {
            const message = typeof data === 'string' ? data : data.message;
            throw new Error(message || 'Something went wrong');
        }
        return data;
    },
    delete: async (endpoint) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() },
        });
        const data = await parseResponse(response);
        if (!response.ok) {
            const message = typeof data === 'string' ? data : data.message;
            throw new Error(message || 'Something went wrong');
        }
        return data;
    }
};

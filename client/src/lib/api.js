const stripTrailing = (s = '') => s.replace(/\/+$/, '')
const stripLeading = (s = '') => s.replace(/^\/+/, '')

const BASE_URL = stripTrailing(process.env.NEXT_PUBLIC_API_BASE_URL || '')

function buildUrl(path = '') {
    if(!BASE_URL) return path;
    return `${BASE_URL}/${stripLeading(String(path))}`;
}

async function apiFetch(
    path,
    { method = 'GET', token, body, headers, cache = 'no-store', revalidate = 0 } = {}
) {
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    const isBrowser = typeof window !== 'undefined';

    const init = {
        method,
        headers: {
            ...(isForm ? {} : { 'Content-Type': 'application/json'}),
            ...(token
                ?  { Authorization: token.startsWith?.('Bearer ') ? token : `Bearer ${token}` }
                : {}
            ),
            ...headers
        },
        body: isForm ? body : body ? JSON.stringify(body) : undefined,
        ...(isBrowser ? { credential: 'include' } : {}),
        cache,
        next: { revalidate }
    }

    const response = await fetch(buildUrl(path), init);

    let data;
    try{
        data = await response.json()
    } catch(e) {
        console.error("error fetching : ", e);
        data = {}
    }

    if(!response.ok) {
        const msg = data?.message || `HTTP ${response.status}`
        const err = new Error(msg)

        err.response = { data, status: response.status}
        throw err
    }

    return data
}


export const api = {
    get: (p, opt) => apiFetch(p, {...opt, method: "GET"}),
    post: (p, body, opt) => apiFetch(p, {...opt, method: "POST", body}),
    put: (p, body, opt) => apiFetch(p, {...opt, method: "PUT", body}),
    patch: (p, body, opt) => apiFetch(p, {...opt, method: "PATCH", body}),
    delete: (p, opt) => apiFetch(p, {...opt, method: "DELETE"})
}
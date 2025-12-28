import { api } from "@/lib/api";

export async function createNoteApi(payload, token) {
    const response = await api.post('note/', payload, {token});
    return response?.data ?? response
}

export async function fetchPublicNotesApi({
    page=1,
    perPage=12,
    q='',
    sort='created_at',
    order='desc'
} = {}) {
    const params = new URLSearchParams(
        {
            page: String(page),
            per_page: String(perPage),
            sort,
            order
        }
    )

    if(q) params.set('q', q)

    const response = await api.get(`note/?${params.toString()}`)
    const data = response?.data ?? response
    const meta = response?.meta ?? { page:1, per_page:12, total:0, pages:1}

    return {
        items: data ?? [],
        meta
    }
}

export async function fetchMyNoteApi({
    page=1,
    perPage=12,
    q='',
    sort='created_at',
    order='desc'
} = {}, token) {
    const params = new URLSearchParams(
        {
            page: String(page),
            per_page: String(perPage),
            sort,
            order
        }
    )
    if(q) params.set('q', q)

    const response = await api.get(`note/me?${params.toString()}`, { token })

    const data = response?.data ?? response
    const meta = response?.meta ?? { page:1, per_page:12, total:0, pages:1}

    return {
        items: data ?? [],
        meta
    }
}

export async function updateNoteApi(id, payload, token){
    const response = await api.put(`note/${id}`, payload, { token })
    return response?.message ?? response
}

export async function searchNotesApi(q, token) {
    const params = new URLSearchParams()
    if(q) params.set('q', q)

    const response = await api.get(`note/?${params.toString()}`, { token })
    const data = response?.data ?? response
    return Array.isArray(data) ? data : data.items ?? []
}

export async function getNoteBySlugApi(slug, { token, password } = {}) {
    console.log({slug})
    const url = `note/${encodeURIComponent(slug)}` + (password ? `?password=${encodeURIComponent(password)}` : "")

    const response = await api.get(url, { token })

    const data = response.data ?? response
    return data
}
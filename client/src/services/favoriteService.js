import { api } from "@/lib/api";
import { toBool } from "@/utils/toBool";

export const toggleLikeApi = async (noteId, token) => {
    const response = await api.post(`like/${noteId}`, null, { token })
    const data = response?.json ?? response
    return { liked: toBool(data?.liked) }
}


export const fetchMyFavoriteApi = async ({ page = 1, perPage = 200 } = {}, token) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
    const response = await api.get(`/like/?${params.toString()}`, { token })

    const data = response?.data ?? response
    const meta = response?.meta ?? { page:1, per_page:12, total:0, pages:1}

    return {
        items: data ?? [],
        meta
    }
}

export const fetchMyFavoriteIds = async (token) => {
    const { items } = await fetchMyFavoriteApi({ page: 1, perPage: 1000 }, token)
    return new Set(items.map(n => String(n.id)))
}
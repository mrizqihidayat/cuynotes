const stripTrailing = (s = '') => s.replace(/\/+$/, '')
const stripLeading = (s = '') => s.replace(/^\/+/, '')

// Support both legacy FRONTEND_IMG and API_IMG env names
const API_IMG = stripTrailing(process.env.NEXT_PUBLIC_API_IMG_URL || process.env.NEXT_PUBLIC_FRONTEND_IMG_URL || '')

export function imgUrl(path) {
    if(!path) return ''
    if(/^https?:\/\//i.test(path)) return path
    if(!API_IMG) return `/${stripLeading(path)}`
    return `${API_IMG}/${stripLeading(path)}`
}
import { create } from "zustand";
import { fetchMyFavoriteApi, fetchMyFavoriteIds, toggleLikeApi } from "@/services/favoriteService";
import { useAuth } from "./useAuth";

const toKey = (id) => String(id ?? '')

export const useFavorite = create(
    (set, get) => ({
        items: [],
        meta: { page: 1, per_page: 12, total: 0, pages: 1 },
        favoriteIds: new Set(),
        pendingIds: new Set,
        loading: false,

        has(noteId) {return get().favoriteIds.has(toKey(noteId))},
        isPending(noteId) {return get().pendingIds.has(toKey(noteId))},
        
        async load(params = {}) {
            set({loading: true})
            try {
                const auth = useAuth.getState() || {}
                let token = auth.token;
                if(!token) throw new Error("Tidak ada token, silahkan login.")
                if(token.startsWith('Bearer ')) token = token.slice(7)

                const { items, meta } = await fetchMyFavoriteApi(params, token)
                const ids = new Set(items.map(n => toKey(n.id)))
                set({ items, meta, favoriteIds: ids, loading: false })
                return { ok: true }
            } catch (error) {
                set({loading: false})
                return { ok: false, error: error.message}
            }
        },

        async loadIds() {
            try {
                const auth = useAuth.getState() || {}
                let token = auth.token;
                if(!token) throw new Error("Tidak ada token, silahkan login.")
                if(token.startsWith('Bearer ')) token = token.slice(7)

                const idsSet = await fetchMyFavoriteIds(token)
                const normalized = new Set(Array.from(idsSet, id => toKey(id)))
                set({ favoriteIds: normalized })
            } catch (error) {
                return { ok: false, error: error.message}
            }
        },

        async toggle(noteId) {
            const auth = useAuth.getState() || {}
            let token = auth.token;
            if(!token) throw new Error("Tidak ada token, silahkan login.")
            if(token.startsWith('Bearer ')) token = token.slice(7)

            const key = toKey(noteId)
            const { favoriteIds, pendingIds } = get()
            const willLike = !favoriteIds.has(key)


            const nextIds = new Set(favoriteIds)
            willLike ? nextIds.add(key) : nextIds.delete(key)

            const nextPending = new Set(pendingIds)
            nextPending.add(key)

            set({ favoriteIds: nextIds, pendingIds: nextPending })

            try {
                await toggleLikeApi(noteId, token)

                setTimeout(async () => {
                    try {
                        const auth2 = useAuth.getState() || {}
                        let token2 = auth2.token;
                        if(!token2) throw new Error("Tidak ada token, silahkan login.")
                        if(token2.startsWith('Bearer ')) token2 = token2.slice(7)

                        const idSet = await fetchMyFavoriteIds(token2)
                        const normalized = new Set(Array.from(idSet, id => toKey(id)))
                        set({ favoriteIds: normalized })
                    } catch (error) {
                        return { ok: false, error: error.message}
                    }
                }, 300)

                return willLike
            } catch (error) {
                const revert = new Set(get().favoriteIds)
                willLike ? revert.delete(key) : revert.add(key)
                set({ favoriteIds: revert  })
                throw error
            } finally {
                const p = new Set(get().favoriteIds)
                p.delete(key)
                set({ pendingIds: p })
            }
        }
    })
)
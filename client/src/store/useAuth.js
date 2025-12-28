"use client"

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
    loginApi,
    registerApi,
    getProfileApi,
    updateUserApi
} from "@/services/authService";

const noStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
}


export const useAuth = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            loading: false,


            isAuthenticated: () => !!get().token,


            async login({ username, password }) {
                set({loading: true});

                try {
                    const response = await loginApi({ username, password });
                    const { data } = response;

                    set({
                        user: {
                            id: data.id,
                            username: data.username,
                            email: data.email
                        },
                        token: data.token,
                        loading: false
                    });
                    
                    return { ok: true };
                } catch(err) {
                    set({loading: false})
                    return {ok: false, error: err?.message || "Login failed"}
                }
            },

            async register(payload) {
                set({loading: true});

                try{
                    const response = await registerApi(payload)
                    const { data } = response;
                    set({loading: false})
                    return { ok: true, data }
                } catch(err){
                    set({loading: false})
                    return { ok: false, error: err?.message || "Register failed"}
                }
            },

            async checkSession() {
                const { token } = get() || {};
                if(!token) return {ok: false, error: "no token"}

                try {
                    const pure = token.startsWith('Bearer ') ? token.slice(7) : token;

                    const response = await getProfileApi(pure);
                    const { data } = response;

                    set({
                        user: {
                            id: data.id,
                            username: data.username,
                            email: data.email,
                            profile_img: data.profile_img,
                            thumbnail_img: data.thumbnail_img
                        }
                    })

                    return { ok: true }
                } catch (err) {
                    set({ user: null, token: null })
                    return { ok: false, error: err?.message || "Session Invalid"}
                }
            },

            async updateProfile(values = {}, files = {}) {
                const {token} = get() || {}
                if(!token) return {ok: false, error: "no token"}

                const pure = token.startsWith('Bearer ') ? token.slice(7) : token;

                const fd = new FormData();
                ["username", "email", "password"].forEach((key) => {
                    if(values[key]) fd.append(key, values[key])
                })

                if(files.profile) fd.append("profile_img", files.profile)
                if(files.thumbnail) fd.append("thumbnail_img", files.thumbnail)

                const response = await updateUserApi(fd, pure);

                const {data} = response;

                set({
                    user: {
                        id: data.id,
                        username: data.username,
                        email: data.email,
                        profile_img: data.profile_img,
                        thumbnail_img: data.thumbnail_img
                    }
                })

                return {ok: true, data}
            },

            logout() {
                set({ user:null, token: null })
            }
        })
    )
)
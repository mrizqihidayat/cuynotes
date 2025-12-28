import { api } from "@/lib/api";

export async function registerApi(payload) {
    return api.post("register/", payload);
}

export async function loginApi(payload) {
    return api.post("login/", payload);
}

export async function getProfileApi(token) {
    return api.get("user/", { token });
}

export async function updateUserApi(payload, token) {
    return api.put("user/", payload, { token });
}
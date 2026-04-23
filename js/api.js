const API_BASE_URL = "https://animehunt-backend.animehunt715.workers.dev/api";

export const api = {
    async getContent() {
        const res = await fetch(`${API_BASE_URL}/get-content`);
        if (!res.ok) throw new Error("API error");
        return res.json();
    }
};

const API_BASE = "https://animehunt-backend.animehunt715.workers.dev/api";

// 🔥 TRANSFORM FUNCTION (VERY IMPORTANT)
function transformAnime(item) {
    return {
        id: item.id,
        title: item.title,
        year: item.year,
        rating: item.rating,
        type: item.type,

        // FIXED MAPPING
        thumbnail_url: item.poster,
        banner_url: item.banner,

        // CATEGORY SYSTEM (important for homepage rows)
        category: mapCategory(item),

        genre: item.genres?.[0] || "",

        is_banner: item.isBanner,
        is_trending: item.isTrending,
        is_hidden: item.isHidden
    };
}

// 🔥 CATEGORY LOGIC (tumhara homepage isi pe depend karega)
function mapCategory(item) {
    if (item.isTrending) return "trending";
    if (item.isMostViewed) return "most-viewed";
    if (item.status === "ongoing") return "ongoing";

    // fallback from genre
    if (item.genres?.includes("action")) return "action";
    if (item.genres?.includes("romance")) return "romance";
    if (item.genres?.includes("drama")) return "drama";
    if (item.genres?.includes("adventure")) return "adventure";

    return "other";
}

export const api = {
    async getContent() {
        const res = await fetch(`${API_BASE}/public/anime`); // ⚠️ CHANGE ENDPOINT
        const json = await res.json();

        if (!json.success) throw new Error("API failed");

        // 🔥 TRANSFORM HERE
        return json.data.map(transformAnime).filter(i => !i.is_hidden);
    }
};

const API =
"https://animehunt-backend.animehunt715.workers.dev/api"

export async function getRecommendations(
  slug
) {

  try {

    const res =
      await fetch(
        `${API}/recommendations/${slug}`
      )

    const json =
      await res.json()

    return json.data || []

  } catch {

    return []
  }
}

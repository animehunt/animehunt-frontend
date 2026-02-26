/* ===============================
   GLOBAL API CONFIG
================================ */
const API_TIMEOUT = 8000; // 8s
const API_RETRY = 1;

/* ===============================
   CORE FETCH WRAPPER
================================ */
async function apiRequest(path, options = {}, retryCount = API_RETRY) {

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {

    const res = await fetch(path, {
      credentials: "same-origin",
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        ...options.headers
      },
      ...options
    });

    clearTimeout(timeoutId);

    if (!res.ok) {

      // Retry once if network/server error
      if (retryCount > 0 && res.status >= 500) {
        return apiRequest(path, options, retryCount - 1);
      }

      return {
        success: false,
        status: res.status,
        data: null,
        error: "API error"
      };
    }

    let data = null;

    try {
      data = await res.json();
    } catch {
      data = null;
    }

    return {
      success: true,
      status: res.status,
      data,
      error: null
    };

  } catch (err) {

    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      return {
        success: false,
        status: 408,
        data: null,
        error: "Request timeout"
      };
    }

    return {
      success: false,
      status: 0,
      data: null,
      error: "Network error"
    };
  }
}

/* ===============================
   SIMPLE GET HELPER
================================ */
async function apiGet(path) {
  return apiRequest(path, { method: "GET" });
}

/* ===============================
   SIMPLE POST HELPER
================================ */
async function apiPost(path, body) {
  return apiRequest(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

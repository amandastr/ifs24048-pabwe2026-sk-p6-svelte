const apiHelper = (() => {
  async function fetchData(url, options = {}) {
    const urlQuery = url.includes("?") ? url.split("?")[1] : "";
    const urlWithoutQuery = url.replace(`?${urlQuery}`, "");
    const fixUrl = urlWithoutQuery.endsWith("/")
      ? urlWithoutQuery.slice(0, -1)
      : urlWithoutQuery;
    const fullUrl = fixUrl + (urlQuery ? `?${urlQuery}` : "");

    const token = getAccessToken();
    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(fullUrl, {
      ...options,
      mode: "cors",
      headers,
    });
  }

  function putAccessToken(token) {
    if (!token) {
      localStorage.removeItem("accessToken");
    } else {
      localStorage.setItem("accessToken", token);
    }
  }

  function getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  return {
    fetchData,
    putAccessToken,
    getAccessToken,
  };
})();

export default apiHelper;

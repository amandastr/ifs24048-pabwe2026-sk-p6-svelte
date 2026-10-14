import apiHelper from "../../../helpers/apiHelper";

const linkTreeApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/link-trees`;

  function _url(path) {
    return BASE_URL + path;
  }

  async function _request(path, options, fallbackMessage) {
    const response = await apiHelper.fetchData(_url(path), options);
    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || fallbackMessage);
    }
    return result;
  }

  function _json(method, payload) {
    return {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
  }

  async function postLinkTree(title, type, description) {
    const result = await _request(
      "/",
      _json("POST", { title, type, description }),
      "Gagal menambahkan link tree"
    );
    return result.data;
  }

  async function postLinkTreeCover(linkTreeId, cover) {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");
    const result = await _request(
      `/${linkTreeId}/cover`,
      { method: "POST", body: formData },
      "Gagal mengubah cover"
    );
    return result.message;
  }

  async function putLinkTree(linkTreeId, title, type, description) {
    const result = await _request(
      `/${linkTreeId}`,
      _json("PUT", { title, type, description }),
      "Gagal mengubah link tree"
    );
    return result.message;
  }

  async function getLinkTrees(isMe = "") {
    const hasFilter = isMe !== "" && isMe !== null && isMe !== undefined;
    const result = await _request(
      hasFilter ? `/?is_me=${isMe}` : "/",
      { method: "GET" },
      "Gagal mengambil data link tree"
    );
    return result.data?.link_trees || [];
  }

  async function getLinkTreeById(linkTreeId) {
    const result = await _request(
      `/${linkTreeId}`,
      { method: "GET" },
      "Gagal mengambil detail link tree"
    );
    return result.data?.link_tree;
  }

  async function deleteLinkTree(linkTreeId) {
    const result = await _request(
      `/${linkTreeId}`,
      { method: "DELETE" },
      "Gagal menghapus link tree"
    );
    return result.message;
  }

  async function deleteAllLinkTrees() {
    const result = await _request(
      "/",
      { method: "DELETE" },
      "Gagal menghapus semua link tree"
    );
    return result.message;
  }

  async function postItem(linkTreeId, title, url) {
    const result = await _request(
      `/${linkTreeId}/items`,
      _json("POST", { title, url }),
      "Gagal menambahkan item tautan"
    );
    return result.message;
  }

  async function putItem(linkTreeId, itemId, title, url) {
    const result = await _request(
      `/${linkTreeId}/items/${itemId}`,
      _json("PUT", { title, url }),
      "Gagal mengubah item tautan"
    );
    return result.message;
  }

  async function deleteItem(linkTreeId, itemId) {
    const result = await _request(
      `/${linkTreeId}/items/${itemId}`,
      { method: "DELETE" },
      "Gagal menghapus item tautan"
    );
    return result.message;
  }

  return {
    postLinkTree,
    postLinkTreeCover,
    putLinkTree,
    getLinkTrees,
    getLinkTreeById,
    deleteLinkTree,
    deleteAllLinkTrees,
    postItem,
    putItem,
    deleteItem,
  };
})();

export default linkTreeApi;

import apiHelper from "../../../helpers/apiHelper";

const userApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/users`;

  function _url(path) {
    return BASE_URL + path;
  }

  async function getUsers() {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil data pengguna");
    }

    return result.data?.users || [];
  }

  async function getUserById(userId) {
    const response = await apiHelper.fetchData(_url(`/${userId}`), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil detail pengguna");
    }

    return result.data?.user;
  }

  async function getProfile() {
    const response = await apiHelper.fetchData(_url("/me"), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil data profil");
    }

    return result.data?.user;
  }

  async function putProfile(name, email) {
    const response = await apiHelper.fetchData(_url("/me"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
      }),
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengubah profil");
    }

    return result.data?.user;
  }

  async function postProfilePhoto(photo) {
    const formData = new FormData();
    formData.append("photo", photo, photo.name || "profile.png");
    const response = await apiHelper.fetchData(_url("/me/photo"), {
      method: "PUT",
      body: formData,
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengubah foto profil");
    }

    return result.message;
  }

  async function putProfilePassword(password, newPassword, newPasswordConfirmation) {
    const response = await apiHelper.fetchData(_url("/password"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation || newPassword,
      }),
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengubah kata sandi");
    }

    return result.message;
  }

  return {
    getUsers,
    getUserById,
    getProfile,
    putProfile,
    postProfilePhoto,
    putProfilePassword,
  };
})();

export default userApi;

<script>
  import { usersStore } from "../states/usersStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";
  import { User, Camera, Check, LoaderCircle, ShieldCheck } from "lucide-svelte";

  $: profile = $usersStore.profile;

  let name = "";
  let email = "";
  let oldPassword = "";
  let newPassword = "";
  let newPasswordConfirmation = "";

  let loadingProfile = false;
  let loadingPhoto = false;
  let loadingPassword = false;

  $: if (profile) {
    name = profile.name || "";
    email = profile.email || "";
  }

  $: if ($usersStore.isChangeProfile) {
    loadingProfile = false;
    usersStore.setIsChangeProfile(false);
  }

  $: if ($usersStore.isChangeProfilePhoto) {
    loadingPhoto = false;
    usersStore.setIsChangeProfilePhoto(false);
  }

  $: if ($usersStore.isChangeProfilePassword) {
    loadingPassword = false;
    usersStore.setIsChangeProfilePassword(false);
    oldPassword = "";
    newPassword = "";
    newPasswordConfirmation = "";
  }

  function handleUpdateProfile() {
    if (!name.trim()) {
      showErrorDialog("Nama tidak boleh kosong!");
      return;
    }
    if (!email.trim()) {
      showErrorDialog("Email tidak boleh kosong!");
      return;
    }
    loadingProfile = true;
    usersStore.asyncPutProfile(name.trim(), email.trim());
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorDialog("Pilih file gambar yang valid!");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showErrorDialog("Ukuran file foto maksimal 3MB!");
      return;
    }

    loadingPhoto = true;
    usersStore.asyncPostProfilePhoto(file);
  }

  function handleUpdatePassword() {
    if (!oldPassword) {
      showErrorDialog("Kata sandi lama wajib diisi!");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showErrorDialog("Kata sandi baru minimal 6 karakter!");
      return;
    }
    if (newPassword !== newPasswordConfirmation) {
      showErrorDialog("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    loadingPassword = true;
    usersStore.asyncPutProfilePassword(
      oldPassword,
      newPassword,
      newPasswordConfirmation
    );
  }
</script>

{#if !profile}
  <div class="flex flex-col items-center justify-center py-24">
    <LoaderCircle size={36} class="text-indigo-600 animate-spin mb-2" />
    <p class="text-sm font-medium text-slate-600">Memuat data profil...</p>
  </div>
{:else}
  <div class="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        Profil Akun
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Kelola informasi identitas, foto profil, dan keamanan akun Anda.
      </p>
    </div>

    <!-- Profile Card Header -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
      <div class="relative group">
        {#if profile.photo}
          <img
            src={profile.photo}
            alt={profile.name}
            class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-indigo-100"
          />
        {:else}
          <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-3xl shadow-md">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
          </div>
        {/if}

        <label
          data-testid="upload-profile-photo-btn"
          class="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer transition-transform hover:scale-105"
          title="Ubah Foto Profil"
        >
          {#if loadingPhoto}
            <LoaderCircle size={16} class="animate-spin" />
          {:else}
            <Camera size={16} />
          {/if}
          <input
            type="file"
            data-testid="profile-photo-file-input"
            accept="image/*"
            on:change={handlePhotoUpload}
            class="hidden"
          />
        </label>
      </div>

      <div class="text-center sm:text-left space-y-1">
        <h2 class="text-xl font-bold text-slate-800">{profile.name}</h2>
        <p class="text-sm text-slate-500">{profile.email}</p>
        <div class="pt-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            <Check size={14} /> Terverifikasi
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Form Biodata -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div class="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User size={18} />
          </div>
          <h3 class="font-bold text-slate-800">Ubah Biodata</h3>
        </div>

        <form on:submit|preventDefault={handleUpdateProfile} class="space-y-4">
          <div>
            <label for="profile-name-input" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Nama Lengkap
            </label>
            <input
              id="profile-name-input"
              type="text"
              data-testid="profile-name-input"
              bind:value={name}
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          <div>
            <label for="profile-email-input" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <input
              id="profile-email-input"
              type="email"
              data-testid="profile-email-input"
              bind:value={email}
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          <div class="pt-2">
            <button
              type="submit"
              data-testid="submit-profile-btn"
              disabled={loadingProfile}
              class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
            >
              {#if loadingProfile}
                <LoaderCircle size={18} class="animate-spin" />
                <span>Menyimpan Perubahan...</span>
              {:else}
                <span>Simpan Perubahan</span>
              {/if}
            </button>
          </div>
        </form>
      </div>

      <!-- Form Ganti Password -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div class="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <h3 class="font-bold text-slate-800">Keamanan & Password</h3>
        </div>

        <form on:submit|preventDefault={handleUpdatePassword} class="space-y-4">
          <div>
            <label for="current-password-input" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Kata Sandi Saat Ini
            </label>
            <input
              id="current-password-input"
              type="password"
              data-testid="current-password-input"
              bind:value={oldPassword}
              placeholder="••••••"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          <div>
            <label for="new-password-input" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Kata Sandi Baru
            </label>
            <input
              id="new-password-input"
              type="password"
              data-testid="new-password-input"
              bind:value={newPassword}
              placeholder="Minimal 6 karakter"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          <div>
            <label for="confirm-password-input" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Ulangi Kata Sandi Baru
            </label>
            <input
              id="confirm-password-input"
              type="password"
              data-testid="confirm-password-input"
              bind:value={newPasswordConfirmation}
              placeholder="Konfirmasi kata sandi"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          <div class="pt-2">
            <button
              type="submit"
              data-testid="submit-password-btn"
              disabled={loadingPassword}
              class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-md transition-all disabled:opacity-60"
            >
              {#if loadingPassword}
                <LoaderCircle size={18} class="animate-spin" />
                <span>Memperbarui Password...</span>
              {:else}
                <span>Perbarui Password</span>
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

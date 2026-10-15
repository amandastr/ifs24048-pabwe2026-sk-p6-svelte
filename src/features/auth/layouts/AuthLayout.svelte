<script>
  import { onMount } from "svelte";
  import { Link2 } from "lucide-svelte";
  import { usersStore } from "../../users/states/usersStore";
  import apiHelper from "../../../helpers/apiHelper";
  import { currentPath, navigate } from "../../../router.js";

  $: isLoginActive = $currentPath === "/auth/login";

  onMount(() => {
    const authToken = apiHelper.getAccessToken();
    if (authToken) {
      usersStore.asyncSetProfile();
    }
  });

  $: if ($usersStore.isProfile) {
    usersStore.setIsProfile(false);
    if ($usersStore.profile) {
      navigate("/");
    }
  }
</script>

<main class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
    <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-3">
      <Link2 size={32} strokeWidth={2.5} />
    </div>
    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
      Delcom Link Tree
    </h1>
    <p class="mt-1 text-sm text-slate-600">
      Kumpulkan semua tautan pentingmu dalam satu halaman Link Tree (Svelte)
    </p>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
    <div class="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
      <!-- Tabs -->
      <div class="flex rounded-2xl bg-slate-100 p-1 mb-6">
        <button
          type="button"
          on:click={() => navigate("/auth/login")}
          class="flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all {isLoginActive ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
        >
          Masuk Akun
        </button>
        <button
          type="button"
          on:click={() => navigate("/auth/register")}
          class="flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all {!isLoginActive ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
        >
          Daftar Baru
        </button>
      </div>

      <slot />
    </div>
  </div>
</main>

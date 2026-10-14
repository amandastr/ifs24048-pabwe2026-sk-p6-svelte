<script>
  import { User, Mail, Lock, LoaderCircle, UserPlus } from "lucide-svelte";
  import { authStore } from "../states/authStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";
  import { navigate } from "../../../router.js";

  let name = "";
  let email = "";
  let password = "";
  let passwordConfirmation = "";
  let loading = false;

  $: if ($authStore.isAuthRegister === true) {
    loading = false;
    authStore.setIsAuthRegister(false);
    navigate("/auth/login");
  }

  async function onSubmitHandler() {
    if (!name.trim()) {
      showErrorDialog("Nama lengkap wajib diisi!");
      return;
    }
    if (!email.trim()) {
      showErrorDialog("Email wajib diisi!");
      return;
    }
    if (!password) {
      showErrorDialog("Kata sandi wajib diisi!");
      return;
    }
    if (password !== passwordConfirmation) {
      showErrorDialog("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    loading = true;
    try {
      await authStore.asyncSetIsAuthRegister(name.trim(), email.trim(), password);
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={onSubmitHandler} class="space-y-4">
  <div>
    <label for="register-name-input" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
      Nama Lengkap
    </label>
    <div class="relative">
      <User
        size={18}
        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        id="register-name-input"
        data-testid="register-name-input"
        bind:value={name}
        placeholder="Nama Lengkap"
        class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        required
      />
    </div>
  </div>

  <div>
    <label for="register-email-input" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
      Alamat Email
    </label>
    <div class="relative">
      <Mail
        size={18}
        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="email"
        id="register-email-input"
        data-testid="register-email-input"
        bind:value={email}
        placeholder="nama@email.com"
        class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        required
      />
    </div>
  </div>

  <div>
    <label for="register-password-input" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
      Kata Sandi
    </label>
    <div class="relative">
      <Lock
        size={18}
        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="password"
        id="register-password-input"
        data-testid="register-password-input"
        bind:value={password}
        placeholder="••••••••"
        class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        required
      />
    </div>
  </div>

  <div>
    <label for="register-password-confirm-input" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
      Konfirmasi Kata Sandi
    </label>
    <div class="relative">
      <Lock
        size={18}
        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="password"
        id="register-password-confirm-input"
        data-testid="register-password-confirm-input"
        bind:value={passwordConfirmation}
        placeholder="••••••••"
        class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        required
      />
    </div>
  </div>

  <div class="pt-2">
    <button
      type="submit"
      id="register-submit-button"
      data-testid="register-submit-button"
      disabled={loading}
      class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
    >
      {#if loading}
        <LoaderCircle size={18} class="animate-spin" />
        <span>Sedang Mendaftar...</span>
      {:else}
        <UserPlus size={18} strokeWidth={2.5} />
        <span>Daftar Sekarang</span>
      {/if}
    </button>
  </div>
</form>

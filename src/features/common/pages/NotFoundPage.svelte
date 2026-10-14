<script>
  import { navigate } from "../../../router.js";
  import { CircleQuestionMark, ArrowLeft, House } from "lucide-svelte";
</script>

<div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
  <div class="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100">
    <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
      <CircleQuestionMark size={36} strokeWidth={2.5} />
    </div>

    <div class="space-y-2">
      <h1 class="text-4xl font-black text-slate-900 tracking-tight">404</h1>
      <h2 class="text-xl font-bold text-slate-800">Halaman Tidak Ditemukan</h2>
      <p class="text-sm text-slate-500 leading-relaxed">
        Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
      </p>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
      <button
        type="button"
        data-testid="back-button"
        on:click={() => window.history.back()}
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <button
        type="button"
        data-testid="home-button"
        on:click={() => navigate("/")}
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all"
      >
        <House size={16} />
        Beranda
      </button>
    </div>
  </div>
</div>

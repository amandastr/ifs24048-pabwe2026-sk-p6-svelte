<script>
  import { createEventDispatcher } from "svelte";
  import { currentPath, navigate } from "../../../router.js";
  import {
    LayoutDashboard,
    Users,
    CircleUser,
    ChevronRight,
  } from "lucide-svelte";

  export let isSidebarOpen = false;
  export let onCloseMobile = undefined;

  const dispatch = createEventDispatcher();

  const navItems = [
    {
      to: "/",
      label: "Semua Link Tree",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      to: "/users",
      label: "Semua Pengguna",
      icon: Users,
      exact: false,
    },
    {
      to: "/profile",
      label: "Profil Saya",
      icon: CircleUser,
      exact: false,
    },
  ];

  function handleNav(to) {
    navigate(to);
    dispatch("close-mobile");
    if (onCloseMobile) onCloseMobile();
  }

  function isItemActive(item, path) {
    if (item.exact) {
      return path === item.to;
    }
    return path.startsWith(item.to);
  }
</script>

<div>
  <!-- Mobile Backdrop -->
  {#if isSidebarOpen}
    <div
      data-testid="sidebar-backdrop"
      on:click={() => {
        dispatch("close-mobile");
        if (onCloseMobile) onCloseMobile();
      }}
      on:keydown={(e) => {
        if (e.key === "Escape") {
          dispatch("close-mobile");
          if (onCloseMobile) onCloseMobile();
        }
      }}
      role="button"
      tabindex="0"
      aria-label="Tutup Menu"
      class="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
    ></div>
  {/if}

  <aside
    class="fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 p-4 transition-transform duration-200 ease-in-out md:translate-x-0 {isSidebarOpen
      ? 'translate-x-0'
      : '-translate-x-full'}"
  >
    <div class="flex flex-col h-full justify-between">
      <div class="space-y-6">
        <div>
          <p
            class="px-3 text-xs font-bold uppercase tracking-wider text-slate-400"
          >
            Menu Utama
          </p>
          <nav class="mt-3 space-y-1">
            {#each navItems as item (item.to)}
              {@const active = isItemActive(item, $currentPath)}
              <a
                href={item.to}
                on:click|preventDefault={() => handleNav(item.to)}
                class="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all {active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
              >
                <div class="flex items-center gap-3">
                  <svelte:component
                    this={item.icon}
                    size={20}
                    class={active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-600"}
                  />
                  <span>{item.label}</span>
                </div>
                {#if active}
                  <ChevronRight size={16} />
                {/if}
              </a>
            {/each}
          </nav>
        </div>
      </div>

      <!-- Footer note in sidebar -->
      <div
        class="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100/60"
      >
        <p class="text-xs font-semibold text-indigo-900">
          Praktikum 6 PABWE (Svelte)
        </p>
      </div>
    </div>
  </aside>
</div>

<script>
  import { currentRoute } from "./router.js";
  import AuthLayout from "./features/auth/layouts/AuthLayout.svelte";
  import LoginPage from "./features/auth/pages/LoginPage.svelte";
  import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
  import LinkTreeLayout from "./features/linktrees/layouts/LinkTreeLayout.svelte";
  import HomePage from "./features/linktrees/pages/HomePage.svelte";
  import DetailPage from "./features/linktrees/pages/DetailPage.svelte";
  import UsersPage from "./features/users/pages/UsersPage.svelte";
  import ProfilePage from "./features/users/pages/ProfilePage.svelte";
  import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";
</script>

{#if $currentRoute.layout === 'auth'}
  <AuthLayout>
    {#if $currentRoute.name === 'login'}
      <LoginPage />
    {:else}
      <RegisterPage />
    {/if}
  </AuthLayout>
{:else if $currentRoute.layout === 'linktree'}
  <LinkTreeLayout>
    {#if $currentRoute.name === 'home'}
      <HomePage />
    {:else if $currentRoute.name === 'linktree-detail'}
      <DetailPage linkTreeId={$currentRoute.params.linkTreeId} />
    {:else if $currentRoute.name === 'users'}
      <UsersPage />
    {:else}
      <ProfilePage />
    {/if}
  </LinkTreeLayout>
{:else}
  <NotFoundPage />
{/if}

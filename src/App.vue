<template>
  <div class="app-shell">
    <nav class="site-nav" aria-label="Main navigation">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About Me</RouterLink>
      <RouterLink to="/contact">Contact</RouterLink>
    </nav>

    <main class="site-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.site-nav {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.site-nav a {
  text-decoration: none;
  font-weight: 500;
}

.site-main {
  min-height: calc(100vh - 4rem);
}
</style>

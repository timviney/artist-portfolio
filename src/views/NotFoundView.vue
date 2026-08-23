<template>
  <section class="page not-found">
    <p class="eyebrow">404</p>
    <h1 class="not-found__title">This page doesn't exist</h1>
    <p class="section-lede">
      The address may have changed, or the link may be wrong.
    </p>
    <RouterLink to="/" class="not-found__link">Back to the front page
      <span aria-hidden="true">→</span></RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  padding-block: 7rem 9rem;
  text-align: center;
}

.not-found__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 7vw, 5rem);
  font-weight: 380;
  line-height: 1.05;
}

.not-found__lede {
  margin: 0;
}

.not-found__link {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5em;
  margin-top: 0.5rem;
  color: var(--color-text);
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-style: italic;
  text-decoration: none;
  transition: color 200ms ease;
}

.not-found__link span {
  transition: transform 320ms var(--ease-out-soft);
}

.not-found__link:hover,
.not-found__link:focus-visible {
  color: var(--color-primary);
}

.not-found__link:hover span,
.not-found__link:focus-visible span {
  transform: translateX(0.35em);
}
</style>

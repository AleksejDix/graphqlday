<template>
  <div class="max-w-md mx-auto p-4 owl">
    <nav class="flex owl-x">
      <nuxt-link :to="{ name: 'index' }">Intro</nuxt-link>
      <nuxt-link :to="{ name: 'search' }">Speakers</nuxt-link>
    </nav>
    <main>
      <transition name="fade" mode="out-in">
        <nuxt />
      </transition>
    </main>
  </div>
</template>

<style>
.owl-x > * + * {
  margin-left: 1rem;
}
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>

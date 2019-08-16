<template>
  <nav role="navigation">
    <div class="flex">
      <div class="w-1/3">
        <nuxt-link
          v-if="prev"
          class="underline text-blue-500 inline-block p-2"
          rel="prev"
          :to="prev"
          >prev</nuxt-link
        >
      </div>
      <div class="w-1/3 text-center">
        <div class="p-2">({{ page }} from {{ pages }})</div>
      </div>
      <div class="w-1/3 text-right">
        <nuxt-link
          v-if="next"
          class="underline text-blue-500 inline-block p-2"
          :to="next"
          rel="next"
          >more</nuxt-link
        >
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  props: {
    page: {
      type: Number,
      required: true
    },
    perPage: {
      type: Number,
      default: 10
    },
    total: {
      type: Number,
      required: true
    }
  },
  computed: {
    next() {
      if (this.page >= this.pages) return
      const route = this.$route
      const to = {
        ...route,
        ...{
          query: {
            ...route.query,
            page: this.page + 1
          }
        }
      }
      return to
    },
    prev() {
      if (this.page <= 1) return
      const route = this.$route
      const to = {
        ...route,
        ...{
          query: {
            ...route.query,
            page: this.page - 1
          }
        }
      }
      return to
    },
    pages() {
      return Math.ceil(this.total / this.perPage)
    }
  },
  scrollToTop: false
}
</script>

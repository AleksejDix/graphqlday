<template>
  <div class="owl">
    <form class="shadow rounded bg-white p-4 owl" @submit.prevent="updateQuery">
      <label class="block">
        <span class="text-gray-700">Search</span>
        <input
          v-model="search"
          type="search"
          class="form-input mt-1 block w-full"
          name="search"
        />
      </label>
      <div class="block">
        <span class="text-gray-700">Order Results by</span>
        <div class="mt-2">
          <div>
            <label class="inline-flex items-center">
              <input
                v-model="orderBy"
                type="radio"
                class="form-radio"
                value="name_ASC"
                name="orderBy"
              />
              <span class="ml-2">Name Z-A</span>
            </label>
          </div>
          <div>
            <label class="inline-flex items-center">
              <input
                v-model="orderBy"
                type="radio"
                class="form-radio"
                value="name_DESC"
                name="orderBy"
              />
              <span class="ml-2">Name A-Z</span>
            </label>
          </div>
        </div>
      </div>
      <button class="form-button">search</button>
    </form>

    <Pagination
      :per-page="resultsPerPage"
      :total="total"
      :page="Number(page)"
    />

    <transition name="fade" mode="out-in">
      <div v-if="hasSpeakers" :key="$route.fullPath" class="max-w-md mx-auto">
        <ul class="list-reset -m-2">
          <li v-for="speaker in speakers" :key="speaker.id" class="p-2">
            <div
              class="shadow-lg flex items-center bg-white rounded overflow-hidden"
            >
              <div class="w-1/3">
                <img
                  class=" w-full"
                  :src="speaker.speakerPicture.url"
                  :alt="speaker.name"
                />
              </div>
              <div class="p-3">
                <h2 class="text-blue-500 uppercase leading-normal font-bold">
                  {{ speaker.name }}
                </h2>
                talks: {{ speaker.talks.length }}
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div v-else class="py-4">
        No Speakes found.
      </div>
    </transition>
  </div>
</template>

<script>
import speakersFields from '@/fragments/speakersFields'
import Pagination from '@/components/pagination'

const defaultData = {
  orderBy: 'name_ASC',
  speakers: [],
  search: '',
  resultsPerPage: 9,
  page: 1,
  total: 0
}

export default {
  components: {
    Pagination
  },
  data() {
    return defaultData
  },
  computed: {
    hasSpeakers() {
      return this.speakers && this.speakers.length > 0
    },
    shouldIndex() {
      return this.page > Math.ceil(this.total / this.resultsPerPage)
    }
  },
  watch: {
    '$route.query'(n, o) {
      if (n.page !== o.page) {
        this.page = n.page
      }
      this.submit()
    }
  },
  async asyncData(context) {
    console.log('server')
    const page = context.route.query.page || 1

    const first = defaultData.resultsPerPage
    const skip =
      Number(page) * defaultData.resultsPerPage - defaultData.resultsPerPage

    const search = context.route.query.search || ''

    const speakerCountOptions = {
      query: `query ($search: String!) {
        speakersConnection (
            where: {
              name_contains: $search
            }
        ) {
          aggregate {
            count
          }
        }
      }
      `,
      variables: {
        search
      }
    }
    const { data } = await context.$axios.$post('', speakerCountOptions)
    const total = data.speakersConnection.aggregate.count

    if (page > Math.ceil(total / defaultData.resultsPerPage)) {
      context.error({ statusCode: 404, message: 'Item Not Found' })
    }

    const options = {
      query: `query ($search: String!, $first: Int!, $skip: Int!)  {
        speakers (
          first: $first
          skip: $skip
          orderBy : ${defaultData.orderBy},
          where: {
            name_contains: $search
          }
        )  {
          ${speakersFields}
        }
      }`,
      variables: {
        search,
        first,
        skip
      }
    }

    const { data: { speakers } = {} } = await context.$axios.$post('', options)

    const host =
      (context.req && context.req.headers.host) || window.location.host

    return {
      speakers,
      host,
      total,
      page
    }
  },
  methods: {
    updateQuery() {
      const { orderBy, search } = this
      const { query } = this.$route

      this.$router.push({
        query: {
          ...query,
          ...(orderBy && { orderBy, page: 1 }),
          ...(search.length > 0 ? { search, page: 1 } : { search: '', page: 1 })
        }
      })
    },
    submit() {
      this.getSpeakers(this.$route.query)
      this.getSpeakersCount(this.$route.query)
    },
    async getSpeakersCount(query) {
      const speakerCountOptions = {
        query: `query ($search: String!) {
          speakersConnection (
              where: {
                name_contains: $search
              }
          ) {
            aggregate {
              count
            }
          }
        }
        `,
        variables: {
          search: query.search
        }
      }
      const { data } = await this.$axios.$post('', speakerCountOptions)
      this.total = data.speakersConnection.aggregate.count
    },
    async getSpeakers(query) {
      const page = this.page || 1
      const first = this.resultsPerPage
      const skip = Number(page) * this.resultsPerPage - this.resultsPerPage

      const speakerOptions = {
        query: `query ($orderBy: SpeakerOrderByInput, $search: String, $first: Int!, $skip: Int!) {
          speakers (
            first: $first
            skip: $skip
            orderBy: $orderBy,
            where: {
              name_contains: $search
            }
            ) {
            ${speakersFields}
          }
        }`,
        variables: {
          search: query.search,
          first,
          skip,
          orderBy: query.orderBy
        }
      }
      const { data: { speakers } = {}, errors } = await this.$axios.$post(
        '',
        speakerOptions
      )
      if (errors) console.error(errors)
      this.speakers = speakers
    }
  },
  head() {
    return {
      title: 'web zurich Speaker search',
      link: [
        {
          rel: 'canonical',
          href: `http://${this.host}/search${
            this.page ? `?page=${this.page}` : ''
          }`
        }
      ],
      meta: [
        {
          name: 'robots',
          content: this.shouldIndex ? 'noindex, follow' : 'index, follow'
        }
      ]
    }
  }
}
</script>

<style>
.form-button {
  @apply bg-blue-500 text-white font-bold py-2 px-4 rounded;
}
.form-button:hover {
  @apply bg-blue-700;
}
.form-button:focus {
  @apply outline-none shadow-outline;
}

.owl > * + * {
  margin-top: 1rem;
}
</style>

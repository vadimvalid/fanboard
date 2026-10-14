import { ref, watchEffect } from 'vue'
import { FootballApiError } from '@/services/footballApi'

export function useAsyncData<T>(load: () => Promise<T>) {
  const data = ref<T | null>(null)
  const error = ref<FootballApiError | null>(null)
  const isLoading = ref(false)

  watchEffect(async (onCleanup) => {
    let canceled = false

    onCleanup(() => {
      canceled = true
    })

    isLoading.value = true
    error.value = null

    try {
      const result = await load()
      if (!canceled) {
        data.value = result
      }
    } catch (e) {
      if (!canceled) {
        error.value =
          e instanceof FootballApiError ? e : new FootballApiError(0, 'Неизвестная ошибка')
      }
    } finally {
      if (!canceled) {
        isLoading.value = false
      }
    }
  })

  return { data, error, isLoading }
}

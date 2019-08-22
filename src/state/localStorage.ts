import { debounce } from 'lodash'
import { deserializePersistedState } from './workspace/deserialize'

export function serializeState(store) {
  return debounce(
    () => {
      const state = store.getState()
      if (!state.stateInjected) {
        localStorage.setItem('graphql-playground', JSON.stringify(state))
      }
    },
    300,
    { trailing: true },
  ) as any
}

export function deserializeState() {
  try {
    const state = localStorage.getItem('graphql-playground')
    if (state) {
      const json = JSON.parse(state)

      const result = deserializePersistedState(json) as any

      return result
    }
  } catch (e) {}
  return undefined
}

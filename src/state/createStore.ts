import { compose, createStore, Store, applyMiddleware } from 'redux'
import rootReducer from './workspace/reducers'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './rootSaga'

import { serializeState, deserializeState } from './localStorage'
import { getSelectedSession } from './sessions/selectors'

const sagaMiddleware = createSagaMiddleware()
const functions = [applyMiddleware(sagaMiddleware)]

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const initialState = deserializeState()

export default (): Store<any> => {
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers.apply(null, functions),
  )

  store.subscribe(serializeState(store))
  ;(window as any).s = store
  ;(window as any).session = () => {
    return getSelectedSession(store.getState())
  }

  sagaMiddleware.run(rootSaga)
  return store
}

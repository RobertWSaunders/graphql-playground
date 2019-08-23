import { fecthingSagas } from './sessions/fetchingSagas'
import { sharingSagas } from './sharing/sharingSaga'
import { all, AllEffect } from 'redux-saga/effects'
import { sessionsSagas } from './sessions/sagas'

export default function* rootSaga() {
  yield all([...sessionsSagas, ...fecthingSagas, ...sharingSagas])
}

export { AllEffect }

import {all} from 'redux-saga/effects';
import TodayOrderSaga from './saga/TodayOrderSaga';

function* rootSaga() {
  yield all([
    TodayOrderSaga(), // Combine all sagas here
  ]);
}

export default rootSaga

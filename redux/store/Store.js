import {configureStore} from '@reduxjs/toolkit';
import RootReducer from '../RootReducer';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../RootSaga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: RootReducer,
  middleware:()=> [sagaMiddleware] 
});

sagaMiddleware.run(rootSaga);

export default store

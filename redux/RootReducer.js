import {combineReducers} from '@reduxjs/toolkit';
import NavReducer from './reducer/NavReducer';
import TodayOrderReducer from './reducer/TodayOrderReducer';
import RefreshReducer from './reducer/RefreshReducer';

const RootReducer = combineReducers({
  navReducer: NavReducer,
  todayOrderReducer: TodayOrderReducer,
  refreshReducer: RefreshReducer,
});

export default RootReducer;

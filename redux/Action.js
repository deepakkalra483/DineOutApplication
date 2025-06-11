import {SET_ROUTE, SET_TODAY_ORDER_LIST} from './ReduxConstants';

export const SetRoute = routeName => ({
  type: SET_ROUTE,
  data: routeName,
});

export const getTodayOrders = (params) => ({
  type: SET_TODAY_ORDER_LIST,
  params,
});

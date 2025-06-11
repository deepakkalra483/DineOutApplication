import {
  LOGIN_SCREEN,
  NEW_SPLASH_SCREEN,
  SPLASH_SCREEN,
} from '../../src/utils/AppScreens';
import {ADD_NEW_PARAMS, SET_ROUTE} from '../ReduxConstants';

const initialState = {
  currentRoot: NEW_SPLASH_SCREEN,
  params: {},
};

const NavReducer = (state = initialState, action) => {
  switch (action?.type) {
    case SET_ROUTE:
      console.log('name--', action?.data);
      return {
        ...state,
        currentRoot: action?.data?.name,
        params: {...state?.params, ...action?.data?.params},
      };
    case ADD_NEW_PARAMS:
      const userExsit =
        state?.params?.data?.userId == action?.data?.params?.userId;
      const tableExsit = state?.params?.table == action?.data?.params?.table;
      console.log('isExsit--', tableExsit);
      console.log('reducerorder--', action?.data?.params?.orders);
      if (tableExsit) {
        return {
          ...state,
          currentRoot: state?.currentRoot,
          params: userExsit
            ? {
                ...state?.params,
                data: {
                  ...state?.params?.data,
                  orders: [
                    ...action?.data?.params?.orders,
                    ...state?.params?.data?.orders,
                  ],
                },
              }
            : {
                data: {
                  ...action?.data?.params,
                },
              },
        };
      } else {
        return state;
      }
    default:
      return state;
  }
};

export default NavReducer;

import {SET_READ, SET_REFRESH, SET_UNREAD} from '../ReduxConstants';

const initialState = {
  read: false,
};

const RefreshReducer = (state = initialState, action) => {
  switch (action?.type) {
    case SET_REFRESH:
      return {
        ...state,
        read: !state?.read,
      };
    case SET_UNREAD:
      return {
        ...state,
        read: true,
      };
    default:
      return state;
  }
};

export default RefreshReducer;

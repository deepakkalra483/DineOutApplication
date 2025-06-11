import {
  SET_NEW_ORDER,
  SET_TODAY_ORDER_DATA,
  TODAY_ORDER_LOADING,
  UPDATE_READ,
} from '../ReduxConstants';

const initialState = {
  loading: true,
  orders: [],
};

const TodayOrderReducer = (state = initialState, action) => {
  switch (action?.type) {
    case TODAY_ORDER_LOADING:
      return {
        ...state,
        loading: action?.loading,
      };
    case SET_TODAY_ORDER_DATA:
      console.log('reducerData--', action?.data);
      return {
        ...state,
        orders: action?.data,
      };
    case SET_NEW_ORDER: {
      const previousIndex = state?.orders?.findIndex(
        item => item?.userId == action?.data?.id,
      );
      if (previousIndex !== -1) {
        // Create a new updated orders array
        const updatedOrders = [...state.orders];
        updatedOrders[previousIndex] = {
          ...updatedOrders[previousIndex],
          orders: [action?.data, ...updatedOrders[previousIndex].orders],
        };
        return {
          ...state,
          orders: updatedOrders,
        };
      } else {
        // Adding a new order entry
        return {
          ...state,
          orders: [
            ...state.orders,
            {
              userId: action?.data?.id,
              table: action?.data?.table,
              orders: [action?.data],
            },
          ],
        };
      }
    }
    case UPDATE_READ:
      return {
        ...state,
        orders: state.orders.map(order =>
          order.userId === action.userId
            ? {
                ...order,
                orders: order.orders.map(o => ({
                  ...o,
                  read: '1', // Update read status to "1"
                })),
              }
            : order,
        ),
      };
    default:
      return state;
  }
};

export default TodayOrderReducer;

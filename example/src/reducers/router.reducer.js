import { CHANGE_ROUTER_STATE } from '../actions';

const router = (state = {
  count: 0,
  position: 0,
  routerState: {},
}, action) => {
  switch (action.type) {
    case CHANGE_ROUTER_STATE:
      return Object.assign({}, state, { routerState: action.state, position: state.position, count: state.count + 1 });
    default:
      return state;
  }
}

export default router;

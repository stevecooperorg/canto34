import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import codeReducer from '../components/CodeEditor/reducers';

export default combineReducers({
  router: routerReducer,
  code: codeReducer
});

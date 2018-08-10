import { combineReducers } from 'redux';
import ActiveWordReducer from './reducer_active_word'
import TypedAlphaReducer from './reducer_set_typed'
import timer from './reducer_set_timer'
import playing from './reducer_set_playing'

const rootReducer = combineReducers({
	activeWord: ActiveWordReducer,
    typedAlpha: TypedAlphaReducer,
    timer,
    playing
});

export default rootReducer

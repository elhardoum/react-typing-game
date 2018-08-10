export default function(state = null, action) {
	switch (action.type) {
		case 'SET_TIMER': 
			return action.payload
	}
	return state
}
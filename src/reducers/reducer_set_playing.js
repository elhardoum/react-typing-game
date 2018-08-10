export default function(state = null, action) {
	switch (action.type) {
		case 'SET_PLAYING': 
			return action.payload
	}
	return state
}
export default function(state = null, action) {
	switch (action.type) {
		case 'WORD_SELECTED': 
			return action.payload
	}
	return state
}
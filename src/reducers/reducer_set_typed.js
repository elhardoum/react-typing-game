export default function(state = null, action) {
	switch (action.type) {
		case 'ALPHA_TYPED': 
			return action.payload
	}
	return state
}
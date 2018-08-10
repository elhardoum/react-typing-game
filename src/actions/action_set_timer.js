function setTimer(timer) {
  return {
    type: 'SET_TIMER',
    payload: timer
  }
}
export default setTimer;

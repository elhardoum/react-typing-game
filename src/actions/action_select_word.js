function selectWord(word) {
  return {
    type: 'WORD_SELECTED',
    payload: word
  }
}
export default selectWord;

import WORDS_RAW from './const/Words'

const shuffleArray = a => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }

    return a
}

const WORDS = shuffleArray( WORDS_RAW )

const getWords = ( limit, shuffle=1 ) => {
  const initials = [], payload = [];

  (shuffle ? shuffleArray : (s) => s)(WORDS_RAW).forEach(word => {
    if ( payload.length == parseInt( limit ) ) {
      return
    }

    if ( ! initials || initials.indexOf(word[0]) < 0 ) {
      initials.push( word[0] )
      payload.push( word )
    }
  })

  return payload
}

export default {
    getWords
}
import React, { Component } from 'react';
import './../assets/style.scss'
import Word from './Word'
import LEVELS from './../const/Levels'
import {connect} from 'react-redux'
import selectWord from '../actions/action_select_word'
import setTyped from '../actions/action_set_typed'
import setTimer from '../actions/action_set_timer'
import setPlaying from '../actions/action_set_playing'
import {bindActionCreators} from 'redux'

class Wrap extends Component
{
  constructor(props)
  {
    super(props)

    this.state = {
      typing_index: null,
      words: [],
      alpha: null,
      typed_words: [],
      counterInterval: null,
      level_index: 0,
      timeoutIds: null,
      timeouts: [],
    }

    this.SCREEN_INNER_REF = React.createRef()
    this.SPOT_INDEX = 0
    this.EXECUTED_TIMEOUTS = []
  }

  componentWillMount = _ => document.addEventListener('keypress', this.handleKeyPress.bind(this), false)
  componentWillUnmount = _ => document.removeEventListener('keypress', this.handleKeyPress)

  handleKeyPress(e)
  {
    const letter = e.key.toLowerCase(), { words, typing_index } = this.state
    const typed_words = this.state.typed_words || []
    let word;

    // paused state
    if ( ! this.props.playing ) return

    // start counter
    if ( ! /\d/.test( this.state.counterInterval ) ) {
      this.setState({
        counterInterval: setInterval(_ => this.props.setTimer( ( isNaN(parseInt(this.props.timer)) ? 0 : parseInt(this.props.timer) ) + 1 ), 1000)
      })
    }

    if ( typing_index >= 0 && words[ typing_index ] && words[ typing_index ].props && typed_words.indexOf( words[ typing_index ].props.text ) < 0 ) {
      word = words[ typing_index ]
    } else {
      words.forEach((w, index) => {
        if ( w.props.text.startsWith( letter ) && typed_words.indexOf( w ) < 0 ) {
          word = w
          this.setState( { typing_index: index } )
        }
      })
    }

    if ( word && word.props && word.props.text ) {
      let { alpha } = this.state

      if ( ! alpha ) {
        if ( 'string' !== typeof alpha && typed_words.indexOf( word.props.text ) < 0 ) {
          alpha = word.props.text
          this.setState( { alpha } )
        }
      }

      if ( null !== alpha && alpha[0] == letter ) {
        // success
        alpha = alpha.substr(1)
        this.setState( { alpha } )

        this.props.setTyped( word.props.text.replace( new RegExp( `${alpha}$`, 'g' ), '' ) )

        if ( ! alpha ) {
          const { typed_words } = this.state
          typed_words.push( word.props.text )

          this.setState({
            typing_index: null,
            typed_words,
            alpha: null
          })
        }
      }

      this.props.selectWord( word.props.text )
    }
  }

  componentDidMount()
  {
    const { words, words_alpha, typing_index, typed_words, playing } = this.state

    const props = {
      parentRef: this.SCREEN_INNER_REF,
      typingIndex: typing_index,
      typedWords: typed_words,
    }

    const LEVEL = LEVELS[ this.state.level_index ]
    props.speedIndex = LEVEL.speed
    let added_timeout = 0

    const timeouts = [], timeoutIds = []

    LEVEL.words.map((w, i) => {
      if ( 0 === i%4 && i ) {
        added_timeout += LEVEL.added_timeout
      }

      timeouts.push({
        /* ms left to execute */
        t: i *( added_timeout ? LEVEL.timeout : LEVEL.timeout_init ) +added_timeout,
        /* callback */
        c: _ => {
          words.push( <Word text={ w } {...props} spotIndex={ i } /> )
          this.EXECUTED_TIMEOUTS.push( i )
          this.setState( { words } )
        },
        /* index */
        i: i,
        /* used to sync play/pause as it detect remaining ms until next timeout run */
        r: +new Date
      })
    })

    this.setState({ timeouts })
  }

  // round a number to 2 decimals
  round2 = _ => Math.round(_ *100) /100

  toggleGameState()
  {
    if ( this.props.playing ) {
      // pause
      this.props.setPlaying( false )

      // pause the timer
      clearInterval( this.state.counterInterval )
      this.setState({counterInterval: null})

      // pause initial word-added timeouts if any
      const { timeoutIds, timeouts } = this.state

      try {
        Object.keys(timeoutIds).forEach(i => {
          let timeout = timeouts[ i ], ms_left = timeout.t - (+new Date - timeout.r)
          timeouts[ i ].ms_left = ms_left >= 0 ? ms_left : 0
          clearTimeout( Object.values(timeoutIds)[i] )
        })
      } catch ( e ) { /* pass */ }

    } else {
      // start
      this.props.setPlaying( true )

      // start timeouts
      const { timeouts } = this.state
      let { timeoutIds } = this.state
      timeoutIds = timeoutIds || {}

      timeouts.forEach(a => {
        if ( this.EXECUTED_TIMEOUTS.indexOf( a.i ) < 0 ) {
          timeouts[ a.i ].r = +new Date // new value
          timeouts[ a.i ].t = /\d/.test(timeouts[a.i].ms_left) ? timeouts[a.i].ms_left : a.t // new value
          timeoutIds[ a.i ] = setTimeout( a.c, timeouts[ a.i ].t )
        }
      })
      this.setState( { timeoutIds, timeouts } )
    }
  }

  render() {
    const { words, typed_words, level_index } = this.state
    const { timer, playing } = this.props
    const avg = typed_words.length > 0 && timer > 0 ? this.round2( (typed_words.length *60) / timer ) : 0
    const meta = [`LEVEL ${level_index+1}`, `${this.round2( timer/60 )} MIN`, `AVG SCORE: ${avg} w/min`]

    return (
      <div className="screen">
        <div className="inner" ref={this.SCREEN_INNER_REF}>
          <div>{words.map((word, i) => <span key={i}>{word}</span>)}</div>
          <div className="meta">
            <button onClick={() => this.toggleGameState()}>{ ! playing && 'START ZE GAME' || 'PAUSE ZE GAME' }</button>
            <div className="info">
              {meta.map((t,i) => {
                return <div key={i}>{t}</div>
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state =>
{
  return {
    timer: state.timer,
    playing: state.playing
  }
}

const mapDispatchToProps = dispatch =>
{
  return bindActionCreators({
    selectWord: selectWord,
    setTyped: setTyped,
    setTimer: setTimer,
    setPlaying: setPlaying,
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Wrap)

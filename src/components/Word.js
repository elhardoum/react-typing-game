import React, { Component } from 'react'
import {connect} from 'react-redux'

const SPEEDS = {
  0.2: .2,
  0.1: .2,
  0.08: .2,
  0.06: .2,
  0.04: .2,
  0.02: .2
}

class Word extends Component
{
  constructor(props)
  {
    super(props)

    this.state = {
      top: 0,
      left: 0,
      interval: null,
      visible: false,
    }

    this.REF = React.createRef()
  }

  intervalCallback(initial)
  {
    if ( ! this.props.playing && ! initial ) return

    const { top, left, interval } = this.state
    const { typedWords, text } = this.props

    if ( (typedWords||[]).indexOf( text ) >= 0 ) {
      null !== interval && (_ => clearInterval(interval) && this.setState({ interval: null }))()
    }

    const { x, width } = this.REF.current.getBoundingClientRect()
    const parentRef = this.props.parentRef.current
    const parentRect = parentRef.getBoundingClientRect()
    const remainingWidth = parentRef.scrollWidth - width - ( x - parentRect.x )

    if ( ! this.state.visible ) {
      let avail_space = parentRef.scrollWidth/4
      let initial_left = avail_space * ( this.props.spotIndex %4 )

      if ( avail_space - width > 0 ) {
        initial_left += (avail_space - width) /2
      }

      if ( initial_left + width > parentRect.width ) {
        initial_left -= initial_left +width -parentRect.width
      }

      return this.setState({ visible: true, left: initial_left })
    }

    let going_left = parseInt(Math.random()*10) %2, going_right = ! going_left

    if ( going_left ) {
      if ( x -2 < parentRect.x ) {
        // don't
        going_left = false
        going_right = true
      }
    } else {
      if ( remainingWidth -2 < 0 ) {
        // don't
        going_left = true
        going_right = false
      }
    }

    const newState = { top: top+2, left: left + (going_right ? 2 : -2) }

    if ( ! this.state.animation_duration ) {
      newState.animation_duration = .2
    }

    this.setState( newState )
  }

  getSpeed = _ => Object.keys( SPEEDS )[ this.props.speedIndex ]

  componentDidMount()
  {
    let interval = setInterval(_ => {
      null !== this.props.parentRef.current && (_ => {
        clearInterval(interval)
        
        // initial run (to avoid initial interval waiting)
        this.intervalCallback(true)

        // run in lööps
        this.setState({interval: setInterval(this.intervalCallback.bind(this), this.getSpeed() *1000)})
      })()
    }, 100)

    if ( /\d/g.test( this.props.typingIndex ) ) {
      console.log( this.props.typingIndex )
    }
  }

  render()
  {
    const {top, left, visible} = this.state
    const animation_duration = Object.values( SPEEDS )[ this.props.speedIndex ]
    const inline_css = { transform: `translate(${left}px, ${top}px)`, visibility: visible ? '' : 'hidden', transition: `all ${animation_duration}s ease-in-out` }
    const selected = this.props.active_word == this.props.text
    const alpha = this.props.typed_alpha
    const is_typed = (this.props.typedWords||[]).indexOf( this.props.text ) >= 0
    let word_display

    if ( is_typed ) {
      word_display = this.props.text.split('').map((t,i) => {
        return <Transparent text={ t.toLowerCase() } key={i}/>
      })
    } else if ( selected ) {
      word_display = this.props.text.replace(new RegExp( `^${alpha}`, 'g' ), alpha.toUpperCase()).split('').map((t,i) => {
        return /[A-Z]/.test(t) ? <Transparent text={ t.toLowerCase() } key={i}/> : t
      })
    } else {
      word_display = this.props.text
    }

    return (
      <span
        className={ ['word', selected && ! is_typed ? 'active' : ''].join(' ') }
        style={ inline_css }
        ref={this.REF}
        >{ word_display }</span>
    )
  }
}

class Transparent extends Component
{
  render = _ => <span style={{ color: 'transparent' }}>{ this.props.text }</span>
}

const mapStateToProps = state =>
{
  return {
    active_word: state.activeWord,
    typed_alpha: state.typedAlpha,
    playing: state.playing
  }
}

export default connect(mapStateToProps)(Word)

import React from 'react'

const Check = (props) => {
  return (
    <div className="check">
      <h3>{props.feedback.check}</h3>
      <p>{props.feedback.reason}</p>
      <button onClick={props.displayNext} type='button'>Next Question</button>
    </div>
  )
}

export default Check

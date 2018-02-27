import {FETCH_QUESTIONS} from '../actions/eval'

const evalQuestions = (state = [''], action) => {
  switch (action.type) {
    case FETCH_QUESTIONS:
      return action.questions
    default:
      return state
  }
}

export default evalQuestions

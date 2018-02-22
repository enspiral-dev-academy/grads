import request from '../lib/api'
import {showError} from './error'
// import {clearError} from './error'
export const REQUEST_SAVE_GRAD_PROFILE = 'REQUEST_SAVE_GRAD_PROFILE'
export const RECEIVE_SAVE_GRAD_PROFILE = 'RECEIVE_SAVE_GRAD_PROFILE'

const requestGradProfile = () => {
  return {
    type: REQUEST_SAVE_GRAD_PROFILE
  }
}

const receiveGradProfile = () => {
  return {
    type: RECEIVE_SAVE_GRAD_PROFILE,
    info: {}
  }
}

export function getGradProfile (userId) {
  return (dispatch) => {
    dispatch(requestGradProfile())
    request('get', `/users/${userId}`)
      .then(res => {
        dispatch(receiveGradProfile(res.body))
        // dispatch(clearError())
      })
      .catch(() => {
        dispatch(showError('An unexpected error in getting user info'))
      })
  }
}

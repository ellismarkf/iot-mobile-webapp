import { combineReducers, createStore, applyMiddleware, compose } from 'redux'
import { routerReducer } from 'react-router-redux'
import thunk from 'redux-thunk'
import AWS from 'aws-sdk'

AWS.config.update({
  region: 'us-west-2',
  accessKeyId: 'AKIAIUR5C7GXAHQRSM6A',
  secretAccessKey: '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'
})

const ddb = new AWS.DynamoDB({region: 'us-west-2'})
const docClient = new AWS.DynamoDB.DocumentClient()

/* ACTIONS */

const requestDevices = () => ({
  type: 'REQUEST_DEVICES'
})

const receiveDevices = (devices) => ({
  type: 'RECEIVE_DEVICES',
  devices
})

export const fetchDevices = () => {
  return dispatch => {
    dispatch(requestDevices())
    docClient.scan({ TableName: 'devices' }, (err, data) => {
      if (err) console.log(JSON.stringify(err, null, 2))
      else dispatch(receiveDevices(data.Items))
    })
  }
}

const requestControls = () => ({
  type: 'REQUEST_CONTROLS'
})

const receiveControls = (controls) => ({
  type: 'RECEIVE_CONTROLS',
  controls
})

export const fetchControls = () => {
  return dispatch => {
    dispatch(requestControls())
    docClient.scan({ TableName: 'uiControls' }, (err, data) => {
      if (err) console.log(JSON.stringify(err, null, 2))
      else dispatch(receiveControls(data.Items))
    })
  }
}

const requestDeviceTypes = () => ({
  type: 'REQUEST_DEVICE_TYPES'
})

const receiveDeviceTypes = (deviceTypes) => ({
  type: 'RECEIVE_DEVICE_TYPES',
  deviceTypes
})

export const fetchDeviceTypes = () => {
  return dispatch => {
    dispatch(requestDeviceTypes())
    docClient.scan({ TableName: 'deviceTypes' }, (err, data) => {
      if (err) console.log(JSON.stringify(err, null, 2))
      else dispatch(receiveDeviceTypes(data.Items))
    })
  }
}

const updateControl = (value, device, control) => ({
  type: 'UPDATE_CONTROL',
  device,
  control,
  value
})

export const updateValue = (value, device, control) => {
  return (dispatch, getState) => {
    const activeDevice = getState().devices.find( d =>
      d.name === device.name)
    const prevValue = activeDevice.controlVals[control]
    const newValue = activeDevice.controlVals[control].length ?
      activeDevice.controlVals[control].indexOf(value) :
      value
    console.log(`device id ${device.deviceId}, type ${device.deviceType} changed ${control} from ${prevValue} to ${newValue}`)
    dispatch(updateControl(value, device, control))
    const params = {
      TableName: 'devices',
      Key: {
        deviceId: device.deviceId
      },
      UpdateExpression: `SET controlVals.${activeDevice.controlVals[control].length ? 'nowPlaying' : control} = :v`,
      ExpressionAttributeValues: {
          ":v": newValue
      }
    }
    docClient.update(params, (err, data) => {
      if (err) console.log(JSON.stringify(err, null, 2))
      else console.log('changes saved successfully!')
    })
  }
}

/* REDUCERS */
const device = (state, action) => {
  if (state.name !== action.device.name) return state
  switch (action.type) {
    case 'UPDATE_CONTROL':
      if (state.controlVals[action.control].length) {
        return Object.assign({}, state, {
          controlVals: Object.assign({}, state.controlVals, {
            nowPlaying: state.controlVals[action.control].indexOf(action.value) 
          })
        })
      }
      else return Object.assign({}, state, {
        controlVals: Object.assign({}, state.controlVals, {
          [action.control]: action.value 
        })
      })
    default:
      return state
  }
}

const devices = (state = [], action) => {
  switch (action.type) {
    case 'RECEIVE_DEVICES':
      return [...state, ...action.devices]
    case 'UPDATE_CONTROL':
      return state.map( d => device(d, action))
    default:
      return state
  }
}


const controls = (state = [], action) => {
  switch (action.type) {
    case 'RECEIVE_CONTROLS':
      return [...state, ...action.controls]
    default:
      return state
  }
}

const deviceTypes = (state = [], action) => {
  switch (action.type) {
    case 'RECEIVE_DEVICE_TYPES':
      return [...state, ...action.deviceTypes]
    default:
      return state
  }
}

const reducers = combineReducers({
  devices,
  controls,
  deviceTypes,
  routing: routerReducer
})


/* STORE */

export const configureStore = initialState =>
  createStore(
    reducers,
    initialState,
    compose(
      applyMiddleware(thunk)
    )
  )
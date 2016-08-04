import React, { Component } from 'react'
import { connect } from 'react-redux'
import { updateValue } from '../state'

const DeviceDetail = ({ device, controls, updateValue }) => (
  <div>
    {controls.map(control => {
      if (control.label === 'nowPlaying') return ''
      else return (
      <div key={`${device.name}-${control.label}`} className='ui-control'>
        <p>{control.label}</p>
        {control.component.uiControl === 'Slider' &&
          <input type='range' value={control.value}
                 onChange={(e) =>
                  updateValue(parseInt(e.target.value), device, control.label)} />}
        {control.component.uiControl === 'Select' &&
          <select onChange={(e) =>
                    updateValue(e.target.value, device, control.label)}
                  value={device.controlVals[control.label][device.controlVals.nowPlaying]}>
            {device.controlVals[control.label].map((item, index) => (
              <option key={`${device.name}-select-${index}`}>
                {item}
              </option>
            ))}
          </select>}
        {control.component.uiControl === 'Switch' &&
          <div className={control.value > 0 ? 'switch-active' : 'switch-inactive'}>
            <button onClick={(e) => 
              updateValue(Math.abs(e.target.innerHTML - 1), device, control.label)}>
              {control.value}
            </button>
          </div>
        }
      </div>
    )})}
  </div>
)

const mapStateToProps = (state, props) => {
  const current = state.devices.find(
    device => device.name === props.params.device
  )
  const controls = state.deviceTypes.find( type =>
    type.name === current.deviceType).controls
  return {
    device: current,
    controls: controls.map( (control, index) => ({
        label: control,
        value: current.controlVals[control],
        component: state.controls.find( c => {
          if (c === 'nowPlaying') return false
          else return c.displayName === control
        })
      })
    )
  }
}

const mapDispatchToState = (dispatch) => ({
  updateValue: (value, device, control) =>
    dispatch(updateValue(value, device, control))
})

export default connect(mapStateToProps, mapDispatchToState)(DeviceDetail)
// @flow
import React from 'react'
import { render } from 'react-dom'
import Application from './Application'



const getRootNode = (): HTMLElement | false =>
  document.body instanceof HTMLElement
  && document.body.appendChild(
    document.createElement('main')
  )

const host = getRootNode()

render(<Application />, host)

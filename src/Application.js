// @flow
// @flow-runtime
import 'babel-polyfill'

// flow-ignore
import '../styles/index.less'

import React, { Component, Fragment } from 'react'
import { hot } from 'react-hot-loader'
import ExpressionInputField from './components/ExpressionInput'
import FunctionComposerInput from './components/FunctionComposerInput'



const page = {
  title: 'React Formula Field',
  subtitle: 'Input element for composing formulae.'
}


@hot(module)
export default class Application extends Component<{}> {

  render () {
    return <Fragment>
      <header className='page'>
        <h1>{ page.title }</h1>
        <sub>{ page.subtitle }</sub>
      </header>
      <main className='page'>
        <ExpressionInputField />
      </main>
      <footer className='page'>
      </footer>
    </Fragment>
  }

}

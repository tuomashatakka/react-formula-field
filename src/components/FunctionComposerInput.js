/**
 * @module FunctionComposerInputComponent
 * @author tuomashatakka<tuomas.hatakka@gmail.com>
 * @flow
 */

import self from 'autobind-decorator'
import React, { PureComponent, Fragment, createRef } from 'react'
import className from 'classnames'
import BlockModel from '../models/Block'
import selectFromKeymap from '../utils/keymap'
import { doWithoutDefault } from '../utils'

import type { BlockProperties } from '../models/Block'


export default class FunctionComposerInputComponent extends PureComponent<*, *> {

  static classNames = {
    list: 'expression-field'
  }

  state = {
    active: 0,
    blocks: [ BlockModel.empty ]
  }

  get keymap () {
    return {

      'space':          this.splitActiveBlock,
      'enter':          this.appendBlock,

      'ctrl-backspace': this.removeBlock,
      'backspace':      this.removeBlockIfEmpty,

      'shift-tab':      this.selectPrevious,
      'tab':            this.handleTab,
      'ctrl-right':     this.selectNext,
      'ctrl-left':      this.selectPrevious,
      'right':          this.handleMoveRight,
      'left':           this.handleMoveLeft,
    }
  }

  @self
  appendBlock () {
    const previousBlocks = this.blocks
    const index          = previousBlocks.length
    const blocks         = [ ...previousBlocks, new BlockModel({ content: '', index }) ]

    this.setState({
      blocks,
      active: index,
    })
  }

  get activeIndex (): number {
    return this.state.active
  }

  get blocks (): Array<BlockModel> {
    return this.state.blocks
  }

  get activeBlock (): BlockModel {
    return this.blocks[this.activeIndex]
  }

  get currentValue (): string {
    return this.activeBlock.content
  }

  @self
  handleKey (event: SyntheticKeyboardEvent<*>) {
    const params = selectFromKeymap(this.keymap, event.nativeEvent)
    if (params.action)
      return doWithoutDefault(params.action, event, params)
  }

  @self
  setActive (active: number) {
    this.setState({ active })
  }

  @self
  setValue (value: string) {
    const block  = this.activeBlock
    const blocks = [ ...this.blocks ]

    block.content = value
    blocks.splice(this.activeIndex, 1, block)
    this.setState({ blocks })
  }

  @self
  handleChange (event: SyntheticKeyboardEvent<*>) {
    this.setValue(event.target.value)
  }


  render () {

    const renderInput = (block) => {
      return <Input
        onChange = { this.handleChange }
        onKey    = { this.handleKey }
        value    = { this.currentValue }
      />
    }

    const renderBlock = (block: BlockModel, id: number) => {

      const select = () =>
        this.setActive(id)

      return <Block
        { ...block.toJSON() }
        select = { select }
      />
    }

    return <ol className={ className(this.constructor.classNames.list, this.props.className) }>

      { this.state.blocks.map((block, id) =>
        <Fragment key={ id }>
          { id === this.activeIndex
            ? renderInput(block)
            : renderBlock(block, id)
          }
        </Fragment>
      )}
    </ol>
  }

}


class Block extends PureComponent<BlockProperties & { select: Function }> {

  get className () {
    return className('token', 'static')
  }

  get content () {
    return this.props.content
  }

  @self
  handleClick () {
    this.props.select()
  }

  render () {
    return <li
      onClick   = { this.handleClick }
      className = { this.className }>
      { this.content }
    </li>
  }
}


type InputProps = {
  value: string,
  onKey: Function,
  onChange: Function,
}


class Input extends PureComponent<InputProps> {

  inputElement = createRef()

  get node () {
    return this.inputElement.current
  }

  get className () {
    return className('token', 'active')
  }

  render () {
    return <input
      type      = 'text'
      ref       = { this.inputElement }
      value     = { this.props.value }
      onChange  = { this.props.onChange }
      onKeyDown = { this.props.onKey }
      className = { this.className }
    />

  }
}

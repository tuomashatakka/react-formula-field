import self from 'autobind-decorator'
import React, { Component, createRef } from 'react'
import className from 'classnames'

import Block from '../models/Block'
import selectFromKeymap from '../utils/keymap'
import { doWithoutDefault } from '../utils'
import { selectionIsAtStart, selectionIsAtEnd } from '../utils/selection'


export default class ExpressionField extends Component {

  inputElement = createRef()

  static classNames = {
    list: 'expression-field'
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

  get activeBlock () {
    return this.getBlock(this.activeBlockIndex)
  }

  get activeBlockIndex () {
    return this.state.active
  }

  get currentValue () {
    return this.activeBlock.content
  }

  get lastBlock () {
    return this.getBlock(this.lastBlockIndex)
  }

  get lastBlockIndex () {
    return this.state.blocks.length - 1
  }

  get isLastBlockSelected () {
    return this.state.active >= this.lastBlockIndex
  }

  constructor (props) {
    super(props)

    const blocks = load()
    assertBlock(blocks)
    this.state = {
      blocks,
      active: blocks.length - 1,
    }
  }

  componentDidUpdate (props, state) {
    this.removeEmptyBlocks()
    // this.removeTrailingEmptyBlocks(state.blocks)
  }

  removeTrailingEmptyBlocks (blocks) {
    const lastIndex   = this.lastBlockIndex
    const activeIndex = this.activeBlockIndex
    let index         = lastIndex

    while (index > activeIndex + 1)
      if (this.getBlock(index).hasNoTextContent) index--
      else break

    const diff = lastIndex - index

    if (diff === 0)
      return null
    blocks.splice(index + 1, diff)
    return this.updateState({ blocks })
  }

  removeEmptyBlocks () {
    const blockset = new Set(this.blocks)
    const count    = blockset.size

    for (let block of blockset)
      if (block.hasNoTextContent && !block.isActive)
        blockset.delete(block)

    if (blockset.size !== count) {
      const blocks = [ ...blockset ].map(toJSON)
      this.updateState({ blocks })
    }
  }

  get blocks () {

    const mapBlock = (_, n) => this.getBlock(n)
    return new Range(this.lastBlockIndex)
      .map(mapBlock)
  }

  forEachBlock (fn) {
    return this.blocks.map(fn)
  }

  handleChange ({ target }) {
    const content = target.value
    return this.updateActiveBlock(content)
  }

  handleKey (event) {
    const params = selectFromKeymap(this.keymap, event.nativeEvent)
    if (params.action)
      return doWithoutDefault(params.action, event, params)
  }

  @self
  handleTab () {
    if (this.isLastBlockSelected)
      return this.appendBlock()
    return this.selectNext()
  }

  @self
  handleMoveLeft () {
    if (selectionIsAtStart())
      return this.selectPrevious()
    return null
  }

  @self
  handleMoveRight () {
    if (selectionIsAtEnd())
      return this.selectNext()
    return null
  }

  async updateState (state) {
    if (state.blocks) {
      const active = typeof state.active === 'number' ? state.active : this.activeBlockIndex
      if (state.blocks.length <= active)
        state.active = state.blocks.length - 1
    }

    const setState = resolve => this.setState(state, resolve)
    await new Promise(setState)
    save(state.blocks)

    return this.state
  }

  @self
  insertBlock (index, block = {}) {
    const blocks = [ ...this.state.blocks ]
    blocks.splice(index, 0, block)
    return this.updateState({ blocks, active: index })
  }

  @self
  appendBlock () {
    const block = {
      content: this.state.current
    }
    return this.insertBlock(this.state.active + 1, block)
  }

  @self
  removeBlock (index = null) {
    if (typeof index !== 'number')
      index = this.state.active
    const blocks = [ ...this.state.blocks ]
    const active = Math.max(0, index - 1)

    blocks.splice(index, 1)
    assertBlock(blocks)

    return this.updateState({
      blocks,
      active,
    })
  }

  @self
  removeBlockIfEmpty (index = null) {
    if (typeof index !== 'number')
      index = this.state.active
    const block = this.getBlock(index)
    if (block.isEmpty)
      return this.removeBlock(index)
    return null
  }

  @self
  selectPrevious () {
    return this.setActiveBlock(this.state.active - 1)
  }

  @self
  selectNext () {
    return this.setActiveBlock(this.state.active + 1)
  }

  @self
  setActiveBlock (n) {
    const index    = parseInt(n)
    const maximum  = this.state.blocks.length - 1
    const active   = Math.max(0, Math.min(maximum, index))

    if (isNaN(index))
      throw new RangeError(`Invalid block index value <${typeof index}> ${index}.`)
      this.selectInputContents()
    return this.updateState({ active })
  }

  selectInputContents () {
    if (this.inputElement.current)
      requestAnimationFrame(() =>
        this.inputElement.current.select())
  }

  getBlock (n) {
    const index    = parseInt(n)
    const maximum  = this.lastBlockIndex
    const negative = index < 0
    const exceeded = index > maximum
    const active   = index === this.activeBlockIndex

    if (isNaN(index))
      throw new RangeError(`Invalid block index value <${typeof index}> ${index}.`)

    if (negative || exceeded)
      throw new RangeError(`Block index out of bounds (${index} ∉ [0…${maximum}]).`)
    return new Block({
      ...this.state.blocks[index],
      active,
      index,
    })
  }

  @self
  async splitActiveBlock () {
    const block   = this.activeBlock
    const residue = block.getContentBeforeSelection()
    const content = block.getContentAfterSelection()
    await this.updateActiveBlock(residue)
    await this.insertBlock(this.state.active + 1, { content })
    return this.state
  }

  @self
  updateActiveBlock (content) {
    return this.updateBlockAtIndex(this.state.active, content)
  }

  @self
  updateBlockAtIndex (index, content) {
    const block = this.getBlock(index)
    const blocks = [ ...this.state.blocks ]
    block.content = content
    blocks.splice(index, 1, block.toJSON())
    return this.updateState({ blocks })
  }

  render () {
    return <ol className={ className(this.constructor.classNames.list, this.props.className) }>

      { this.state.blocks.map((block, id) =>
        <BlockComponent
          id={ id }
          key={ id }
          block={ block }
          active={ id === this.state.active }
          select = { () => this.setActiveBlock(id) }
        />
      )}

      <input
        onKeyDown={ this.handleKey.bind(this) }
        onChange={ this.handleChange.bind(this) }
        type='text'
        className='token active'
        value={ this.currentValue }
        ref={ this.inputElement }
      />
    </ol>
  }
}


class BlockComponent extends Component {

  render () {
    const { active, select, block } = this.props
    const classes = className('token static', { active })
    return <li
      className={ classes }
      onClick={ select }>
      { block.content }
    </li>
  }

}


class Range {

  constructor (length, first = 0) {
    this.indice = Array
      .from(Array(length))
      .fill(first)
      .map((base, index) => base + index)
  }

  map (fn) {
    return this.indice.map(fn)
  }
}


function load () {
  const blocks = localStorage.getItem('blocks')
  return blocks
    ? JSON.parse(blocks)
    : []
}

function save (blocks = []) {
  const serializedData = JSON.stringify(blocks)
  localStorage.setItem('blocks', serializedData)
}

const getEmptyBlock = () => ({
  content: '',
})

function assertBlock (payload) {
  if (!payload.length)
    payload.push(getEmptyBlock())
}


const toJSON = block =>
  block.toJSON()

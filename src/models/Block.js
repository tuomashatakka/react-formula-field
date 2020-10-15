// @flow
import { getSelectionRange } from '../utils/selection'


export type BlockProperties = {
  index?: number,
  content: string
}


export default class Block {

  static SEPARATOR = ' '

  static get empty (): Block {
    return new Block({
      index:   0,
      content: '',
    })
  }

  index: number
  properties: BlockProperties

  constructor (data: BlockProperties) {
    const { index, ...properties } = data
    this.index = index
    this.properties = properties
  }

  getContentBeforeSelection (): string {
    if (!this.isActive)
      return ''
    const start = getSelectionRange().shift()
    return this.content.substr(0, start)
  }

  getContentAfterSelection (): string {
    if (!this.isActive)
      return ''
    const end = getSelectionRange().pop()
    return this.content.substr(end)
  }

  get hasNoTextContent (): boolean {
    return this.content.trim().length === 0
  }

  get isEmpty (): boolean {
    return this.content.length === 0
  }

  get isActive (): boolean {
    return this.properties.active ? true : false
  }

  get content (): string {
    return this.properties.content || ''
  }

  set content (val: string) {
    this.properties.content = val
  }

  toJSON (): BlockProperties {
    return {
      index:   this.index,
      content: this.content,
    }
  }
}

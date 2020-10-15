

export const getSelectionRange = (node = null) => {
  if (node === null)
    node = document.activeElement
  const start = node.selectionStart
  const end = node.selectionEnd
  return [
    Math.min(start, end),
    Math.max(start, end),
  ]
}

export const selectionIsAtStart = (node) =>
  getSelectionRange(node)[1] === 0

export const selectionIsAtEnd = (node = null) => {
  if (node === null)
    node = document.activeElement
  return getSelectionRange(node)[0] === node.value.length
}

export const getNodeIndex = (node) =>
  [ ...node.parentElement.children ].indexOf(node)

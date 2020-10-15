


export const KEYS = new Map(Object.entries({
  ArrowRight: 'right',
  ArrowLeft:  'left',
  ' ':        'space',
}))


const cleanKey = (key) => KEYS.has(key)
  ? KEYS.get(key)
  : key.toLowerCase()

function resolveKeypressDescriptor (event) {

  const key       = cleanKey(event.key)
  const alt       = event.altKey
  const ctrl      = event.ctrlKey || event.metaKey
  const shift     = event.shiftKey
  const modifiers = {
    cmd: ctrl,
    ctrl,
    shift,
    alt,
  }

  if (key in modifiers)
    return []

  return Object
    .entries(modifiers)
    .filter(extract(2))
    .map(extract(1))
    .concat([ key ])
}

// eslint-disable-next-line block-padding/functions
const extract = (n) =>
  (arr) => arr[n - 1]

const excludeMetaKeys = key =>
  ![ 'ctrl', 'cmd' ].includes(key)

function parseKeyDescriptor (descriptor) {
  const parts    = descriptor.split('-')
  const hasCmd   = parts.includes('cmd')
  const hasCtrl  = parts.includes('ctrl')
  const hasMeta  = hasCmd || hasCtrl

  if (hasMeta)
    return parts
      .filter(excludeMetaKeys)
      .concat([ 'cmd', 'ctrl' ])
  return parts

}

function matchesKeyDescriptor (descriptor, current) {
  if (descriptor.length !== current.length)
    return false
  for (let key of descriptor)
    if (!current.includes(key))
      return false
  return true
}

export default function selectFromKeymap (keymap, event) {
  const current = resolveKeypressDescriptor(event)

  const key = Object
    .entries(keymap)
    .find(([ key ]) => {
      const descriptor = parseKeyDescriptor(key)
      const result = matchesKeyDescriptor(descriptor, current)
      return result
    })

  const action = key
    ? key.pop()
    : null

  return {
    current,
    action,
    key,
  }
}

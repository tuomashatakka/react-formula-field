
export const doWithoutDefault = async (fn, event, ...args) => { // eslint-disable-line import/prefer-default-export
  event.persist()

  const result = await fn(event, ...args)
  const shouldPrevent = result !== null

  if (shouldPrevent)
    event.preventDefault()

  event.constructor.release(event)
  return !shouldPrevent
}

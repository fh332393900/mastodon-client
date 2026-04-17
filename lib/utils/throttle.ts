export type ThrottleOptions = {
  leading?: boolean
  trailing?: boolean
}

export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  wait = 100,
  options: ThrottleOptions = {},
) {
  const { leading = true, trailing = true } = options
  let lastCall = 0
  let timeout: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const invoke = (time: number) => {
    lastCall = time
    const args = lastArgs
    lastArgs = null
    if (args) fn(...args)
  }

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now()
    if (!lastCall && !leading) lastCall = now
    const remaining = wait - (now - lastCall)
    lastArgs = args

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      invoke(now)
    } else if (trailing && !timeout) {
      timeout = setTimeout(() => {
        timeout = null
        invoke(Date.now())
      }, remaining)
    }
  }

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    lastArgs = null
    lastCall = 0
  }

  return throttled
}

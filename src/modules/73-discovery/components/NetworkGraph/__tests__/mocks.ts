/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// To make sure that the tests are working, it's important that you are using
// this implementation of ResizeObserver and DOMMatrixReadOnly
class ResizeObserver {
  callback: globalThis.ResizeObserverCallback

  constructor(callback: globalThis.ResizeObserverCallback) {
    this.callback = callback
  }

  observe(target: Element): void {
    this.callback([{ target } as globalThis.ResizeObserverEntry], this)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}
}

class DOMMatrixReadOnly {
  m22: number
  constructor(transform: string) {
    const scale = transform?.match(/scale\(([1-9.])\)/)?.[1]
    this.m22 = scale !== undefined ? +scale : 1
  }
}

// Only run the shim once when requested
let init = false

export const mockReactFlow = (): void => {
  if (init) return
  init = true

  global.ResizeObserver = ResizeObserver

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.DOMMatrixReadOnly = DOMMatrixReadOnly

  Object.defineProperties(global.HTMLElement.prototype, {
    offsetHeight: {
      get() {
        return parseFloat(this.style.height) || 1
      }
    },
    offsetWidth: {
      get() {
        return parseFloat(this.style.width) || 1
      }
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global.SVGElement as any).prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })
}

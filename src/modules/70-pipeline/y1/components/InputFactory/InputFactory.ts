/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import { InputComponent } from './InputComponent'

export class InputFactory {
  private componentBank: Map<string, InputComponent<unknown>>

  constructor() {
    this.componentBank = new Map()
  }

  registerComponent<T>(component: InputComponent<T>): void {
    this.componentBank.set(component.internalType, component as InputComponent<unknown>)
  }

  getComponent<T>(internalType?: string): InputComponent<T> | undefined {
    if (internalType && !isEmpty(internalType)) {
      return this.componentBank.get(internalType) as InputComponent<T>
    }
    return
  }
}

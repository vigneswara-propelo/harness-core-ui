/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringsMap } from 'stringTypes'
import type { Trigger } from '../components/Triggers/Trigger'
import { TriggerBaseType, TriggerSubType } from '../components/Triggers/TriggerInterface'

export abstract class AbstractTriggerFactory {
  protected triggerBank: Map<TriggerSubType, Trigger<unknown>>

  constructor() {
    this.triggerBank = new Map()
  }

  registerTrigger<T>(trigger: Trigger<T>): void {
    this.triggerBank.set(trigger.getType(), trigger)
  }

  getTrigger<T>(subType: TriggerSubType): Trigger<T> {
    return this.triggerBank.get(subType) as Trigger<T>
  }

  getTriggerBaseType(subType: TriggerSubType): TriggerBaseType {
    return this.getTrigger(subType).getBaseType()
  }

  getDescription(subType: TriggerSubType): keyof StringsMap {
    return this.getTrigger(subType).getDescription()
  }
}

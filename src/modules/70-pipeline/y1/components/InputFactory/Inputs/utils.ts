/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { capitalize } from 'lodash-es'

interface ConditionObject {
  status?: string
  condition: string
}

/**
 * Parses condition string from V1 syntax to extract the status and condition.
 * @param {string} conditionString - The input when string.
 * @returns {ConditionObject} The parsed condition object.
 * @example
 * const conditionString = '<+Always> && <+service.name> == "service2"';
 * Output: { status: 'Always' , condition: '<+service.name> == "service2" }
 */
export const parseConditionString = (conditionString: string): ConditionObject => {
  const conditionParts = conditionString.split('&&').map(part => part.trim())

  return {
    status: conditionParts.length > 1 ? conditionParts[0]?.replace('<+', '').replace('>', '').trim() : undefined,
    condition: conditionParts[conditionParts.length > 1 ? 1 : 0]
  }
}

/**
 * Constructs a condition string as per V1 syntax from a ConditionObject.
 * @param {ConditionObject} conditionObject - The condition object.
 * @returns {string} The constructed condition string.
 * @example
 * const conditionObject = {
 *   status: 'Always',
 *   condition: '<+service.name> == "service2"'
 * };
 * Output: '<+Always> && <+service.name> == "service2"'
 */
export const constructConditionString = (conditionObject: ConditionObject): string => {
  if (conditionObject.status) {
    return `<+${conditionObject.status}> && ${conditionObject.condition}`
  } else {
    return conditionObject.condition
  }
}

export const generateReadableLabel = (name = ''): string => {
  return capitalize(name.split('_').join(' '))
}

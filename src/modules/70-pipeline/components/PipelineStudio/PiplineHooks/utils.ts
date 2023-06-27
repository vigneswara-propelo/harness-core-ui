/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, flatMapDeep, identity, map, sortBy, sortedUniq } from 'lodash-es'
import { VariableMergeServiceResponse, VariableResponseMapValue } from 'services/pipeline-ng'

export interface Params {
  metadataMap: Record<string, VariableResponseMapValue>
  localStageKeys: string[]
}

export interface AllExpressionsObj {
  expressionsList: string[]
  outputExpressions: string[]
  extraExpressions: string[]
  extraOutputExpressions: string[]
}

/**
 * Traverse over stage and find out all local fqn
 */
export function traverseStageObject(
  jsonObj: Record<string, any>,
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
): string[] {
  const keys: string[] = []
  if (jsonObj !== null && typeof jsonObj == 'object') {
    Object.entries(jsonObj).forEach(([_key, value]) => {
      keys.push(...traverseStageObject(value, metadataMap))
    })
  } else if (metadataMap[jsonObj]) {
    keys.push(jsonObj)
  }
  return keys
}

export function pickExpressionsFromMetadataMap(
  metadataMap: Record<string, VariableResponseMapValue>,
  localStageKeys: string[],
  key: 'yamlProperties' | 'yamlOutputProperties'
): string[] {
  return sortedUniq(
    sortBy(
      map(metadataMap, (item, index) =>
        index && localStageKeys.indexOf(index) > -1
          ? defaultTo(item[key]?.localName, '')
          : defaultTo(item[key]?.fqn, '')
      ).filter(p => p),
      identity
    )
  )
}

export function pickExtraExpressionsFromMetadataMap(
  metadataMap: Record<string, VariableResponseMapValue>,
  localStageKeys: string[],
  key: 'properties' | 'outputproperties'
): string[] {
  return sortedUniq(
    sortBy(
      flatMapDeep(metadataMap, (item, index) => {
        const properties = defaultTo(item.yamlExtraProperties?.[key], [])

        return properties.map((p: Record<string, string>) =>
          index && localStageKeys.indexOf(index) > -1 ? p.localName : p.fqn
        )
      }).filter(p => p),
      identity
    )
  )
}

export const getAllExpressionsFromMetadataMap = ({ metadataMap, localStageKeys }: Params): AllExpressionsObj => ({
  expressionsList: pickExpressionsFromMetadataMap(metadataMap, localStageKeys, 'yamlProperties'),
  outputExpressions: pickExpressionsFromMetadataMap(metadataMap, localStageKeys, 'yamlOutputProperties'),
  extraExpressions: pickExtraExpressionsFromMetadataMap(metadataMap, localStageKeys, 'properties'),
  extraOutputExpressions: pickExtraExpressionsFromMetadataMap(metadataMap, localStageKeys, 'outputproperties')
})

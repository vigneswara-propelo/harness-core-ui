/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { parse } from 'yaml'
import { cloneDeep } from 'lodash-es'
import { MonitoredServiceInputSetInterface } from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.types'
import { NGTemplateInfoConfig } from 'services/template-ng'
import { HealthSource, ResponseString } from 'services/cv'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const copyMatchingKeyValues = (Target: any, Source: any): { [key: string]: string | object } => {
  let clonedTarget = cloneDeep(Target || {})
  const sourceCopy = cloneDeep(Source || {})
  Object.keys(clonedTarget).forEach(key => {
    const isObject = typeof sourceCopy[key] === 'object'
    if (isObject) {
      clonedTarget = copyMatchingKeyValues(Target[key], sourceCopy[key])
    } else if (sourceCopy[key] !== undefined) {
      Target[key] = sourceCopy[key]
    }
  })
  return Target
}

export const getHealthsourcewithName = (
  templateJSON: MonitoredServiceInputSetInterface,
  templateValue: NGTemplateInfoConfig
): HealthSource[] | [] => {
  return (
    templateJSON?.sources?.healthSources?.map(item => {
      const hsdata = templateValue?.spec?.sources?.healthSources?.find(
        (hs: HealthSource) => hs?.identifier === item?.identifier
      )
      return {
        ...item,
        name: hsdata?.name
      }
    }) || []
  )
}

export const getInitialFormData = (
  resolvedTemplateData: ResponseString | null,
  templateInputYaml: ResponseString | null
): {
  templateJSON: MonitoredServiceInputSetInterface
  initialFormData: MonitoredServiceInputSetInterface
} => {
  const resolvedTemplateValues = parse(resolvedTemplateData?.data || '')
  const templateJSON = parse(
    templateInputYaml?.data?.replace(/<\+input>/g, '') || ''
  ) as MonitoredServiceInputSetInterface

  let initialFormData = templateJSON
  if (templateJSON && resolvedTemplateValues) {
    const tagregtData = cloneDeep(templateJSON)
    copyMatchingKeyValues(tagregtData, resolvedTemplateValues)
    initialFormData = tagregtData
  }
  return { templateJSON, initialFormData }
}

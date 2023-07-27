/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { UseStringsReturn } from 'framework/strings'
import { ONE_DAY_DURATION } from './SRMStepAnalysis.constants'
import { TWO_HOURS_IN_MILLISECONDS } from '../../../ChangeEventCard.constant'

export const convertToDays = (getString: UseStringsReturn['getString'], duration?: number): string => {
  const dayValue = duration ? duration / ONE_DAY_DURATION : 0
  let dayString = ''
  if (dayValue === 1) {
    dayString = getString('cv.oneDay')
  } else if (dayValue > 1) {
    dayString = getString('cv.nDays', { n: dayValue })
  }
  return `${getString('cv.analyzeDeploymentImpact.duration')}: ${dayString}`
}

export const calculateEndtime = (endTime: number): number => {
  const current = Date.now()
  const isEventEndTimeOutofScope = endTime > current
  if (isEventEndTimeOutofScope) {
    return current + TWO_HOURS_IN_MILLISECONDS
  }
  return endTime + TWO_HOURS_IN_MILLISECONDS
}

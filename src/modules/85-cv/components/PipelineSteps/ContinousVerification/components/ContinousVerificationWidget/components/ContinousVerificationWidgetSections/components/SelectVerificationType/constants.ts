/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { VerificationTypesOptionsType } from './SelectVerificationType.types'

export const continousVerificationTypes: VerificationTypesOptionsType[] = [
  {
    value: 'Auto',
    label: 'Auto',
    icon: { name: 'nav-settings' },
    descriptionKey: 'cv.verifyStep.verificationTypesDescription.auto'
  },
  {
    value: 'Rolling',
    label: 'Rolling Update',
    icon: { name: 'rolling' },
    descriptionKey: 'cv.verifyStep.verificationTypesDescription.rolling'
  },
  {
    value: 'Canary',
    label: 'Canary',
    icon: { name: 'canary' },
    descriptionKey: 'cv.verifyStep.verificationTypesDescription.canary'
  },
  {
    value: 'Bluegreen',
    label: 'Blue Green',
    icon: { name: 'bluegreen' },
    descriptionKey: 'cv.verifyStep.verificationTypesDescription.blueGreen'
  },
  {
    value: 'LoadTest',
    label: 'Load Test',
    icon: { name: 'lab-test' },
    descriptionKey: 'cv.verifyStep.verificationTypesDescription.loadTest'
  }
]

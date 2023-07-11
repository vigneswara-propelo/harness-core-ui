/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useMemo } from 'react'
import * as yup from 'yup'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { PERCENTAGE_ROLLOUT_VALUE } from '@cf/constants'
import type { WeightedVariation } from 'services/cf'

export default function usePercentageRolloutValidationSchema(): yup.Schema<any> {
  const { getString } = useStrings()

  return useMemo<yup.Schema<any>>(
    () =>
      yup.object().when('variation', {
        is: PERCENTAGE_ROLLOUT_VALUE,
        then: yup.object({ variations: getPercentageRolloutVariationsArrayTest(getString) }).required()
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
}

function getTotal(variations: WeightedVariation[]): number {
  return variations.map(({ weight }) => weight || 0).reduce((total, weight) => total + weight, 0)
}

export function getPercentageRolloutVariationsArrayTest(getString: UseStringsReturn['getString']): yup.Schema<any> {
  return yup.array().test(
    'invalidTotalError',
    ({ originalValue: variations = [] }) =>
      100 - getTotal(variations) + getString('cf.percentageRollout.assignToVariation'),
    (variations: WeightedVariation[] = []) => getTotal(variations) === 100
  )
}

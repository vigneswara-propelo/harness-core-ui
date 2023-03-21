/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { PillToggle } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { SLOV2Form } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { getPillToggleOptions, getPillToggleProps } from './Evaluation.utils'

export default function EvaluationTypePillToggle({
  values,
  onChange,
  occurenceBased
}: {
  values: SLOV2Form
  onChange: FormikProps<SLOV2Form>['setFieldValue']
  occurenceBased?: boolean
}): JSX.Element {
  const { getString } = useStrings()

  const pillToggleOptions = getPillToggleOptions(getString, Boolean(occurenceBased))

  const { styleProp, onChangeKey, selectedView } = getPillToggleProps(values, occurenceBased)

  return (
    <PillToggle
      {...styleProp}
      onChange={item => onChange(onChangeKey, item)}
      selectedView={selectedView}
      options={pillToggleOptions}
    />
  )
}

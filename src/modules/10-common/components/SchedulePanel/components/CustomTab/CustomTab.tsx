/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useEffect, useState } from 'react'
import { FormInput } from '@harness/uicore'
import { get } from 'lodash-es'
import { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { CronFormat, getBreakdownValues } from '../utils'
import ExpressionBreakdown, { ActiveInputs } from '../ExpressionBreakdown/ExpressionBreakdown'
import Expression from '../Expression/Expression'
import Spacer from '../Spacer/Spacer'

interface CustomTabInterface {
  formikProps: FormikProps<any>
  isQuartsExpressionSupported: boolean
}

export default function CustomTab(props: CustomTabInterface): JSX.Element {
  const {
    formikProps: { values },
    formikProps,
    isQuartsExpressionSupported
  } = props
  const { getString } = useStrings()
  const [cronFormat, setCronFormat] = useState<CronFormat>(get(values, 'cronFormat', CronFormat.UNIX))

  const onCronFormatChange = (value: CronFormat): void => {
    setCronFormat(value)
  }

  useEffect(() => {
    formikProps.validateForm()
  }, [])

  return (
    <>
      {isQuartsExpressionSupported && (
        <FormInput.RadioGroup
          name="cronFormat"
          items={[
            {
              label: getString('common.schedulePanel.unixExpression'),
              value: CronFormat.UNIX
            },
            {
              label: getString('common.schedulePanel.quartzExpression'),
              value: CronFormat.QUARTZ
            }
          ]}
          radioGroup={{ inline: true }}
          onChange={(e: FormEvent<HTMLInputElement>) => {
            onCronFormatChange(e.currentTarget.value as CronFormat)
          }}
        />
      )}
      <FormInput.Text
        label={getString('common.schedulePanel.enterCustomCron')}
        name="expression"
        style={{ margin: 0 }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e?.target?.value) {
            const breakdownValues = getBreakdownValues(e.target.value)
            formikProps.setValues({ ...values, expression: e.target.value, breakdownValues })
          }
        }}
      />
      {cronFormat === CronFormat.UNIX ? (
        <>
          <Spacer paddingTop="var(--spacing-large)" paddingBottom="var(--spacing-large)" />
          <ExpressionBreakdown
            formikValues={values}
            activeInputs={[
              ActiveInputs.MINUTES,
              ActiveInputs.HOURS,
              ActiveInputs.DAY_OF_MONTH,
              ActiveInputs.MONTH,
              ActiveInputs.DAY_OF_WEEK
            ]}
          />
          <Spacer paddingTop="var(--spacing-large)" />
          <Expression formikProps={formikProps} />
        </>
      ) : null}
    </>
  )
}

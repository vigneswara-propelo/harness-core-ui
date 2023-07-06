/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { FormInput, AllowedTypes, SelectOption, Text, Layout } from '@harness/uicore'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import Card from '@cv/components/Card/Card'
import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import { continousVerificationTypes } from './constants'
import ConfigureFields from '../ConfigureFields/ConfigureFields'
import { VerificationTypes } from '../ConfigureFields/constants'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
interface SelectVerificationTypeProps {
  formik: FormikProps<ContinousVerificationData>
  allowableTypes: AllowedTypes
}

export default function SelectVerificationType(props: SelectVerificationTypeProps): React.ReactElement {
  const { formik, allowableTypes } = props

  const { setFieldValue } = useFormikContext()

  const { getString } = useStrings()

  useEffect(() => {
    if (formik.values?.spec?.type === VerificationTypes.SimpleVerification) {
      setFieldValue('spec.spec.sensitivity', undefined)
      setFieldValue('spec.spec.failOnNoAnalysis', undefined)
    }
  }, [formik.values?.spec?.type])

  const isSimpleVerificationEnabled = useFeatureFlag(FeatureFlag.SRM_ENABLE_SIMPLE_VERIFICATION)

  const continousVerificationTypeOptions = useMemo(() => {
    const options = [...continousVerificationTypes]

    if (isSimpleVerificationEnabled) {
      options.push({
        value: VerificationTypes.SimpleVerification,
        label: getString('pipeline.deploymentType.thresholdAnalysis'),
        icon: { name: 'simple-verification' }
      })
    }

    return options
  }, [isSimpleVerificationEnabled])

  return (
    <Card>
      <>
        <Layout.Vertical spacing={'medium'}>
          <Text font={{ size: 'small' }}>{getString('connectors.cdng.verificationTypeHeading')}</Text>
          <div className={cx(stepCss.formGroup)}>
            <FormInput.Select
              name="spec.type"
              label={getString('connectors.cdng.continousVerificationType')}
              items={continousVerificationTypeOptions as SelectOption[]}
            />
          </div>
        </Layout.Vertical>
        {formik?.values?.spec?.type ? <ConfigureFields formik={formik} allowableTypes={allowableTypes} /> : null}
      </>
    </Card>
  )
}

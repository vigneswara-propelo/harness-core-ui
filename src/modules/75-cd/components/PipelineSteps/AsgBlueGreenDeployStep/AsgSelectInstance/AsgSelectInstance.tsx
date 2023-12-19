/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useState } from 'react'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType, Text, AllowedTypes } from '@harness/uicore'
import { Color } from '@harness/design-system'

import { toString } from 'lodash-es'
import cx from 'classnames'
import { FormikContextType } from 'formik'
import type { AsgFixedInstances } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ALLOWED_VALUES_TYPE } from '@common/components/ConfigureOptions/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { InstancesType } from '../../ElastigroupSetupStep/ElastigroupSetupTypes'
import type { AsgBlueGreenDeployStepInitialValues } from '../AsgBlueGreenDeployStep'
import type { AsgRollingDeployData } from '../../AsgRollingDeployStep/AsgRollingDeployStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface AsgSelectInstanceProps {
  formik: FormikContextType<AsgBlueGreenDeployStepInitialValues> | FormikContextType<AsgRollingDeployData>
  readonly?: boolean
  allowableTypes: AllowedTypes
}

const AsgSelectInstance = (props: AsgSelectInstanceProps): React.ReactElement => {
  const { formik, readonly, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()
  const { values: formValues, setFieldValue } = formik
  const [instancesType, setInstancesType] = useState<InstancesType>(
    formik.values?.spec?.instances?.type as InstancesType
  )
  const onTypeChange = (value: InstancesType): void => {
    setInstancesType(value)
  }

  const formSpec = formValues?.spec?.instances?.spec as AsgFixedInstances

  return (
    <>
      <FormInput.RadioGroup
        name="spec.instances.type"
        label={
          <Text margin={{ top: 'medium', bottom: 'small' }} color={Color.GREY_600}>
            {getString('instanceFieldOptions.instances')}
          </Text>
        }
        items={[
          {
            label: getString('cd.useAlreadyRunningInstance'),
            value: InstancesType.CurrentRunning
          },
          {
            label: getString('cd.fixedAsgInstances'),
            value: InstancesType.Fixed
          }
        ]}
        radioGroup={{ inline: true }}
        onChange={(e: FormEvent<HTMLInputElement>) => {
          onTypeChange(e.currentTarget.value as InstancesType)
          if (e.currentTarget.value === InstancesType.CurrentRunning) {
            formik.setFieldValue('spec.instances.spec', {})
          }
        }}
      />
      {instancesType === InstancesType.Fixed && (
        <div>
          <div className={cx(stepCss.formGroup, stepCss.lg)}>
            <FormInput.MultiTextInput
              name="spec.instances.spec.min"
              placeholder={getString('cd.ElastigroupStep.minInstances')}
              label={getString('cd.ElastigroupStep.minInstances')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                disabled: readonly,
                allowableTypes,
                textProps: { type: 'number' },
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
            />
            {getMultiTypeFromValue(formSpec?.min) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={toString(formSpec?.min)}
                type="Number"
                variableName="spec.instances.spec.min"
                showRequiredField={false}
                showDefaultField={false}
                onChange={/* istanbul ignore next */ value => setFieldValue('spec.instances.spec.min', value)}
                isReadonly={readonly}
                allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
              />
            )}
          </div>
          <div className={cx(stepCss.formGroup, stepCss.lg)}>
            <FormInput.MultiTextInput
              name="spec.instances.spec.max"
              placeholder={getString('cd.ElastigroupStep.maxInstances')}
              label={getString('cd.ElastigroupStep.maxInstances')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                disabled: readonly,
                allowableTypes,
                textProps: { type: 'number' },
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
            />
            {getMultiTypeFromValue(formSpec?.max) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={toString(formSpec?.max)}
                type="Number"
                variableName="spec.instances.spec.max"
                showRequiredField={false}
                showDefaultField={false}
                onChange={/* istanbul ignore next */ value => setFieldValue('spec.instances.spec.max', value)}
                isReadonly={readonly}
                allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
              />
            )}
          </div>
          <div className={cx(stepCss.formGroup, stepCss.lg, stepCss.bottomMargin4)}>
            <FormInput.MultiTextInput
              name="spec.instances.spec.desired"
              placeholder={getString('cd.ElastigroupStep.desiredInstances')}
              label={getString('cd.ElastigroupStep.desiredInstances')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                disabled: readonly,
                allowableTypes,
                textProps: { type: 'number' },
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
            />
            {getMultiTypeFromValue(formSpec?.desired) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={toString(formSpec?.desired)}
                type="Number"
                variableName="spec.instances.spec.desired"
                showRequiredField={false}
                showDefaultField={false}
                onChange={/* istanbul ignore next */ value => setFieldValue('spec.instances.spec.desired', value)}
                isReadonly={readonly}
                allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default AsgSelectInstance

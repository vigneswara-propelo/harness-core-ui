/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { Container, FormInput, AllowedTypes, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { RadioButtonProps } from '@harness/uicore/dist/components/RadioButton/RadioButton'

import { useStrings } from 'framework/strings'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isWinRmDeploymentType } from '@pipeline/utils/stageHelpers'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { CommandUnitType, SourceType, sourceTypeOptions } from '../CommandScriptsTypes'
import css from './CommandEdit.module.scss'

interface CopyCommandEditProps {
  formik: FormikProps<CommandUnitType>
  allowableTypes: AllowedTypes
  readonly?: boolean
  deploymentType?: string
}

export function CopyCommandEdit(props: CopyCommandEditProps): React.ReactElement {
  const { formik, readonly, allowableTypes, deploymentType = '' } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const sourceOptions = React.useMemo(() => {
    return isWinRmDeploymentType(deploymentType)
      ? sourceTypeOptions.filter((option: RadioButtonProps) => option.value !== SourceType.ARTIFACT)
      : sourceTypeOptions
  }, [deploymentType])

  return (
    <>
      <FormInput.RadioGroup
        name="spec.sourceType"
        radioGroup={{ inline: true }}
        items={sourceOptions}
        label={
          <Text
            color={Color.GREY_500}
            tooltip={isWinRmDeploymentType(deploymentType) ? getString('cd.steps.commands.winRmConfig') : ''}
          >
            {getString('cd.steps.commands.sourceTypeLabel')}
          </Text>
        }
        disabled={readonly}
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          const currentValue = event.currentTarget.value
          formik.setFieldValue('spec.sourceType', currentValue)
        }}
      />

      <Container className={css.destinationPath}>
        <MultiTypeTextField
          label={
            <Text
              tooltipProps={{ dataTooltipId: 'destinationPath' }}
              className={css.destinationPathLabel}
              color={Color.GREY_500}
            >
              {getString('cd.steps.commands.destinationPath')}
            </Text>
          }
          name="spec.destinationPath"
          multiTextInputProps={{
            multiTextInputProps: {
              expressions,
              allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            },
            disabled: readonly,
            placeholder: getString('cd.steps.commands.destinationPathPlaceholder')
          }}
        />
      </Container>
    </>
  )
}

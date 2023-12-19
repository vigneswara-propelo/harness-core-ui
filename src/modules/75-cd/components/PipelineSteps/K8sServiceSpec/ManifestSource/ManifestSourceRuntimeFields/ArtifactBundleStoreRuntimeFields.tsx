/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'

import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import { isExecutionTimeFieldDisabled } from '../../ArtifactSource/artifactSourceUtils'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

export const ArtifactBundleStoreRuntimeFields = ({
  template,
  path,
  manifestPath,
  manifest,
  fromTrigger,
  allowableTypes,
  readonly,
  formik,
  stageIdentifier,
  stepViewType
}: ManifestSourceRenderProps): React.ReactElement => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const isFieldDisabled = (fieldName: string): boolean => {
    if (readonly) {
      return true
    }
    return isFieldfromTriggerTabDisabled(
      fieldName,
      formik,
      stageIdentifier,
      manifest?.identifier as string,
      fromTrigger
    )
  }

  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <>
      {isFieldRuntime(`${manifestPath}.spec.store.spec.deployableUnitPath`, template) && (
        <TextFieldInputSetView
          className={cx(css.fieldAndOptionsWidth, css.verticalSpacingInput)}
          name={`${prefix}${manifestPath}.spec.store.spec.deployableUnitPath`}
          label={getString('pipeline.manifestType.artifactBundle.deployableArtifactPath')}
          disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.deployableUnitPath`)}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          fieldPath={`${manifestPath}.spec.store.spec.repoName`}
          template={template}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType as StepViewType)
          }}
        />
      )}

      {isFieldRuntime(`${manifestPath}.spec.store.spec.manifestPath`, template) && (
        <TextFieldInputSetView
          className={cx(css.fieldAndOptionsWidth, css.verticalSpacingInput)}
          name={`${prefix}${manifestPath}.spec.store.spec.manifestPath`}
          label={getString('pipelineSteps.manifestPathLabel')}
          disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.manifestPath`)}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          fieldPath={`${manifestPath}.spec.store.spec.repoName`}
          template={template}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType as StepViewType)
          }}
        />
      )}
    </>
  )
}

/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { shouldAllowOnlyOneFilePath } from '@pipeline/components/ManifestSelection/ManifestWizardSteps/CommonManifestDetails/utils'
import { ManifestSourceBase, ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import MultiTypeListOrFileSelectList from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/MultiTypeListOrFileSelectList'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { isFieldRuntime } from '../../../K8sServiceSpec/K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../../../K8sServiceSpec/ManifestSource/ManifestSourceUtils'
import ManifestGitStoreRuntimeFields from '../../../K8sServiceSpec/ManifestSource/ManifestSourceRuntimeFields/ManifestGitStoreRuntimeFields'
import css from '../../../K8sServiceSpec/KubernetesManifests/KubernetesManifests.module.scss'

const AwsSamDirectoryGitStoreRuntimeView = (props: ManifestSourceRenderProps): React.ReactElement => {
  const { template, path, manifestPath, manifest, fromTrigger, readonly, formik, stageIdentifier, allowableTypes } =
    props
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

  return (
    <Layout.Vertical
      data-name="manifest"
      key={manifest?.identifier}
      className={cx(css.inputWidth, css.layoutVerticalSpacing)}
    >
      <ManifestGitStoreRuntimeFields {...props} />

      {isFieldRuntime(`${manifestPath}.spec.store.spec.paths`, template) && (
        <div className={css.verticalSpacingInput}>
          <MultiTypeListOrFileSelectList
            template={template}
            fieldPath={`${manifestPath}.spec.store.spec.paths`}
            allowableTypes={allowableTypes}
            name={`${path}.${manifestPath}.spec.store.spec.paths`}
            label={getString('fileFolderPathText')}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.paths`)}
            formik={formik}
            isNameOfArrayType
            allowOnlyOne={shouldAllowOnlyOneFilePath(manifest?.type as ManifestTypes)}
          />
        </div>
      )}

      {isFieldRuntime(`${manifestPath}.spec.samTemplateFile`, template) && (
        <div className={css.verticalSpacingInput}>
          <TextFieldInputSetView
            template={template}
            fieldPath={`${manifestPath}.spec.samTemplateFile`}
            disabled={isFieldDisabled(`${manifestPath}.spec.samTemplateFile`)}
            multiTextInputProps={{
              expressions,
              allowableTypes: props.allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            label={getString('optionalField', {
              name: getString('pipeline.manifestType.awsSamDirectory.samTemplateFile')
            })}
            placeholder={getString('common.enterPlaceholder', {
              name: getString('pipeline.manifestType.awsSamDirectory.samTemplateFile')
            })}
            name={`${path}.${manifestPath}.spec.samTemplateFile`}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

export class AwsSamDirectoryManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = ManifestDataType.AwsSamDirectory

  renderContent(props: ManifestSourceRenderProps): JSX.Element | null {
    if (!props.isManifestsRuntime) {
      return null
    }

    return <AwsSamDirectoryGitStoreRuntimeView {...props} />
  }
}

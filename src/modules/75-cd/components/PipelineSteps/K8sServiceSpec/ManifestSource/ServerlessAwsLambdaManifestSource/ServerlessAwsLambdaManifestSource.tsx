/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import cx from 'classnames'
import { Layout } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ManifestSourceBase, ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { S3ManifestStoreRuntimeView } from '@cd/components/PipelineSteps/ECSServiceSpec/ManifestSource/S3ManifestStoreRuntimeView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import ManifestGitStoreRuntimeFields from '../ManifestSourceRuntimeFields/ManifestGitStoreRuntimeFields'
import MultiTypeListOrFileSelectList from '../MultiTypeListOrFileSelectList'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const ServerlessLambdaGitStoreRuntimeView = (props: ManifestSourceRenderProps): React.ReactElement => {
  const {
    template,
    path,
    manifestPath,
    manifest,
    fromTrigger,
    readonly,
    formik,
    stageIdentifier,
    allowableTypes,
    stepViewType
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const isFieldDisabled = (fieldName: string): boolean => {
    // /* instanbul ignore else */
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
            label={getString('common.git.folderPath')}
            name={`${path}.${manifestPath}.spec.store.spec.paths`}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.paths`)}
            allowableTypes={allowableTypes}
            stepViewType={stepViewType}
            formik={formik}
            isNameOfArrayType
            allowOnlyOne
          />
        </div>
      )}

      {isFieldRuntime(`${manifestPath}.spec.configOverridePath`, template) && (
        <div className={css.verticalSpacingInput}>
          <TextFieldInputSetView
            template={template}
            fieldPath={`${manifestPath}.spec.configOverridePath`}
            disabled={isFieldDisabled(`${manifestPath}.spec.configOverridePath`)}
            multiTextInputProps={{
              expressions,
              allowableTypes: props.allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            label={getString('pipeline.manifestType.serverlessConfigFilePath')}
            placeholder={getString('pipeline.manifestType.serverlessConfigFilePathPlaceholder')}
            name={`${path}.${manifestPath}.spec.configOverridePath`}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

export class ServerlessAwsLambdaManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = ManifestDataType.ServerlessAwsLambda

  renderContent(props: ManifestSourceRenderProps): JSX.Element | null {
    if (!props.isManifestsRuntime) {
      return null
    }

    const manifestStoreType = get(props.template, `${props.manifestPath}.spec.store.type`, null)
    if (manifestStoreType === ManifestStoreMap.S3) {
      return <S3ManifestStoreRuntimeView {...props} pathFieldlabel="fileFolderPathText" />
    }

    return <ServerlessLambdaGitStoreRuntimeView {...props} />
  }
}

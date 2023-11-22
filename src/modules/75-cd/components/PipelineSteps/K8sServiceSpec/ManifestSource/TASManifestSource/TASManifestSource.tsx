/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Layout } from '@harness/uicore'
import { get } from 'lodash-es'
import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ManifestSourceBase, ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { useStrings } from 'framework/strings'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import ManifestGitStoreRuntimeFields from '../ManifestSourceRuntimeFields/ManifestGitStoreRuntimeFields'
import CustomRemoteManifestRuntimeFields from '../ManifestSourceRuntimeFields/CustomRemoteManifestRuntimeFields'
import { ArtifactBundleStoreRuntimeFields } from '../ManifestSourceRuntimeFields/ArtifactBundleStoreRuntimeFields'
import MultiTypeListOrFileSelectList from '../MultiTypeListOrFileSelectList'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const Content = (props: ManifestSourceRenderProps): React.ReactElement => {
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
  const manifestStoreType = get(template, `${manifestPath}.spec.store.type`, null)
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
      <CustomRemoteManifestRuntimeFields {...props} />
      <ArtifactBundleStoreRuntimeFields {...props} />
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.store.spec.files`, template) && (
          <div className={css.verticalSpacingInput}>
            <MultiTypeListOrFileSelectList
              template={template}
              label={getString('fileFolderPathText')}
              name={`${path}.${manifestPath}.spec.store.spec.files`}
              placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
              disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.files`)}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              isNameOfArrayType
              formik={formik}
              manifestStoreType={ManifestStoreMap.Harness}
              allowOnlyOne
            />
          </div>
        )}
        {isFieldRuntime(`${manifestPath}.spec.store.spec.paths`, template) && (
          <div className={css.verticalSpacingInput}>
            <MultiTypeListOrFileSelectList
              template={template}
              fieldPath={`${manifestPath}.spec.store.spec.paths`}
              label={getString('fileFolderPathText')}
              name={`${path}.${manifestPath}.spec.store.spec.paths`}
              placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
              disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.paths`)}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              formik={formik}
              manifestStoreType={manifestStoreType}
              isNameOfArrayType
              allowOnlyOne
            />
          </div>
        )}
      </div>

      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.autoScalerPath`, template) && (
          <div className={css.verticalSpacingInput}>
            <MultiTypeListOrFileSelectList
              template={template}
              fieldPath={`${manifestPath}.spec.store.spec.paths`}
              label={getString('pipeline.manifestType.autoScalerYAMLPath')}
              name={`${path}.${manifestPath}.spec.autoScalerPath`}
              placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
              disabled={isFieldDisabled(`${manifestPath}.spec.autoScalerPath`)}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              formik={formik}
              manifestStoreType={manifestStoreType}
              isNameOfArrayType
              allowOnlyOne
            />
          </div>
        )}
      </div>

      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.varsPaths`, template) && (
          <div className={css.verticalSpacingInput}>
            <MultiTypeListOrFileSelectList
              template={template}
              fieldPath={`${manifestPath}.spec.varsPaths`}
              label={getString('pipeline.manifestType.varsYAMLPath')}
              name={`${path}.${manifestPath}.spec.varsPaths`}
              placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
              disabled={isFieldDisabled(`${manifestPath}.spec.varsPaths`)}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              formik={formik}
              manifestStoreType={manifestStoreType}
              isNameOfArrayType
            />
          </div>
        )}
      </div>
    </Layout.Vertical>
  )
}

export class TASManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = ManifestDataType.TasManifest

  renderContent(props: ManifestSourceRenderProps): JSX.Element | null {
    if (!props.isManifestsRuntime) {
      return null
    }

    return <Content {...props} />
  }
}

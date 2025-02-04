/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { getMultiTypeFromValue, Layout, MultiTypeInputType } from '@harness/uicore'
import { get } from 'lodash-es'
import { StringKeys, useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeCheckboxField } from '@common/components'
import type { ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { shouldAllowOnlyOneFilePath } from '@pipeline/components/ManifestSelection/ManifestWizardSteps/CommonManifestDetails/utils'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import ManifestGitStoreRuntimeFields from './ManifestGitStoreRuntimeFields'
import CustomRemoteManifestRuntimeFields from './CustomRemoteManifestRuntimeFields'
import ManifestCommonRuntimeFields from './ManifestCommonRuntimeFields'
import { isExecutionTimeFieldDisabled } from '../../ArtifactSource/artifactSourceUtils'
import MultiTypeListOrFileSelectList from '../MultiTypeListOrFileSelectList'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

interface ManifestRenderProps extends ManifestSourceRenderProps {
  pathFieldlabel: StringKeys
}
export const ManifestContent = (props: ManifestRenderProps): React.ReactElement => {
  const {
    template,
    path,
    manifestPath,
    manifest,
    fromTrigger,
    allowableTypes,
    readonly,
    formik,
    stageIdentifier,
    pathFieldlabel,
    stepViewType,
    fileUsage
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
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
      <ManifestCommonRuntimeFields {...props} fileUsage={fileUsage} />
      <CustomRemoteManifestRuntimeFields {...props} />
      {isFieldRuntime(`${manifestPath}.spec.store.spec.paths`, template) && (
        <div className={css.verticalSpacingInput}>
          <MultiTypeListOrFileSelectList
            template={template}
            fieldPath={`${manifestPath}.spec.store.spec.paths`}
            allowableTypes={allowableTypes}
            name={`${path}.${manifestPath}.spec.store.spec.paths`}
            label={getString(pathFieldlabel)}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.paths`)}
            formik={formik}
            isNameOfArrayType
            allowOnlyOne={shouldAllowOnlyOneFilePath(manifest?.type as ManifestTypes)}
          />
        </div>
      )}

      {isFieldRuntime(`${manifestPath}.spec.valuesPaths`, template) && (
        <div className={css.verticalSpacingInput}>
          <MultiTypeListOrFileSelectList
            template={template}
            fieldPath={`${manifestPath}.spec.valuesPaths`}
            allowableTypes={allowableTypes}
            name={`${path}.${manifestPath}.spec.valuesPaths`}
            label={getString('pipeline.manifestType.valuesYamlPath')}
            placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
            disabled={isFieldDisabled(`${manifestPath}.spec.valuesPaths`)}
            formik={formik}
            fileUsage={fileUsage}
            manifestStoreType={manifestStoreType}
            isNameOfArrayType
            allowOnlyOne={shouldAllowOnlyOneFilePath(manifest?.type as ManifestTypes)}
          />
        </div>
      )}
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.enableDeclarativeRollback`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormMultiTypeCheckboxField
              disabled={isFieldDisabled(`${manifestPath}.spec.enableDeclarativeRollback`)}
              name={`${path}.${manifestPath}.spec.enableDeclarativeRollback`}
              label={getString('pipeline.manifestType.enableDeclarativeRollback')}
              setToFalseWhenEmpty={true}
              multiTypeTextbox={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.enableDeclarativeRollback`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.enableDeclarativeRollback`)}
            type="String"
            variableName="enableDeclarativeRollback"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.enableDeclarativeRollback`, value)
            }}
            isReadonly={isFieldDisabled(`${manifestPath}.spec.enableDeclarativeRollback`)}
          />
        )}
      </div>

      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.skipResourceVersioning`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormMultiTypeCheckboxField
              disabled={isFieldDisabled(`${manifestPath}.spec.skipResourceVersioning`)}
              name={`${path}.${manifestPath}.spec.skipResourceVersioning`}
              label={getString('skipResourceVersion')}
              setToFalseWhenEmpty={true}
              multiTypeTextbox={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.skipResourceVersioning`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.skipResourceVersioning`)}
            type="String"
            variableName="skipResourceVersioning"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.skipResourceVersioning`, value)
            }}
            isReadonly={isFieldDisabled(`${manifestPath}.spec.skipResourceVersioning`)}
          />
        )}
      </div>
    </Layout.Vertical>
  )
}

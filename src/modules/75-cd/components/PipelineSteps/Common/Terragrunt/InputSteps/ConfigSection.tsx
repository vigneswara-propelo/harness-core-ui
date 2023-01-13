/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType, FormInput, Label, Layout } from '@harness/uicore'
import { connect, FormikContextType } from 'formik'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Connectors } from '@connectors/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import FileStoreList from '@filestore/components/FileStoreList/FileStoreList'
import { fileTypes } from '@pipeline/components/StartupScriptSelection/StartupScriptInterface.types'
import type { TerragruntData, TerragruntProps } from '../TerragruntInterface'
import { getPath } from '../../ConfigFileStore/ConfigFileStoreHelper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function ConfigSectionRef<T extends TerragruntData>(
  props: TerragruntProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { inputSetData, readonly, initialValues, path, allowableTypes, formik, stepViewType, isBackendConfig } = props

  const configPath = getPath(false, true, isBackendConfig)
  const config = inputSetData?.template?.spec?.configuration
  const configSpec = get(inputSetData?.template, configPath)
  const store = configSpec?.store
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  return (
    <>
      {configSpec?.store?.spec && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {isBackendConfig ? getString('pipelineSteps.backendConfig') : getString('cd.configurationFile')}
        </Label>
      )}
      {getMultiTypeFromValue(config?.spec?.workspace) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${path}.spec.configuration.spec.workspace`}
            placeholder={getString('pipeline.terraformStep.workspace')}
            label={getString('pipelineSteps.workspace')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            template={inputSetData?.template}
            fieldPath={'spec.configuration.spec.workspace'}
          />
        </div>
      )}
      {getMultiTypeFromValue(configSpec?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            selected={get(initialValues, `${configPath}.store.spec.connectorRef`, '')}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            multiTypeProps={{ allowableTypes, expressions }}
            width={400}
            type={[Connectors.GIT, Connectors.GITHUB, Connectors.GITLAB, Connectors.BITBUCKET]}
            name={`${path}.${configPath}.store.spec.connectorRef`}
            label={getString('connector')}
            placeholder={getString('select')}
            disabled={readonly}
            setRefValue
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}

      {getMultiTypeFromValue(configSpec?.store?.spec?.branch) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('pipelineSteps.deploy.inputSet.branch')}
            name={`${path}.${configPath}.store.spec.branch`}
            placeholder={getString('pipeline.manifestType.branchPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(configSpec?.store?.spec?.commitId) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('pipeline.manifestType.commitId')}
            name={`${path}.${configPath}.store.spec.commitId`}
            placeholder={getString('pipeline.manifestType.commitPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(configSpec?.store?.spec?.folderPath) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('common.git.folderPath')}
            name={`${path}.${configPath}.store.spec.folderPath`}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}

      {store?.type === 'Harness' &&
        getMultiTypeFromValue(configSpec?.store?.spec?.files) === MultiTypeInputType.RUNTIME && (
          <Layout.Vertical className={cx(stepCss.inputWidth, stepCss.layoutVerticalSpacing)}>
            <FileStoreList
              name={`${path}.${configPath}.store.spec.files`}
              type={fileTypes.FILE_STORE}
              allowOnlyOne={true}
              formik={formik}
            />
          </Layout.Vertical>
        )}

      {store?.type === 'Harness' &&
        getMultiTypeFromValue(configSpec?.store?.spec?.secretFiles) === MultiTypeInputType.RUNTIME && (
          <Layout.Vertical className={cx(stepCss.inputWidth, stepCss.layoutVerticalSpacing)}>
            <FileStoreList
              name={`${path}.${configPath}.store.spec.secretFiles`}
              type={fileTypes.ENCRYPTED}
              allowOnlyOne={true}
              formik={formik}
            />
          </Layout.Vertical>
        )}
    </>
  )
}

const ConfigSection = connect(ConfigSectionRef)
export default ConfigSection

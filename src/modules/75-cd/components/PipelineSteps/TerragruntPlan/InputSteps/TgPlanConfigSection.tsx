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
import { getMultiTypeFromValue, MultiTypeInputType, Label, Layout } from '@harness/uicore'
import { connect } from 'formik'
import { Color } from '@harness/design-system'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import FileStoreList from '@filestore/components/FileStoreList/FileStoreList'
import { fileTypes } from '@pipeline/components/StartupScriptSelection/StartupScriptInterface.types'
import type { TerragruntPlanProps } from '../../Common/Terragrunt/TerragruntInterface'
import { getPath } from '../../Common/ConfigFileStore/ConfigFileStoreHelper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function ConfigSectionRef(props: TerragruntPlanProps & { formik?: any }): React.ReactElement {
  const { getString } = useStrings()

  const { inputSetData, readonly, initialValues, path, allowableTypes, formik, stepViewType, isBackendConfig } = props
  const template = inputSetData?.template
  const configPath = getPath(false, true, isBackendConfig)
  const config = template?.spec?.configuration
  const configSpec = get(template, `${configPath}.store`)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()

  return (
    <>
      {configSpec?.spec && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {
            /* istanbul ignore next */ isBackendConfig
              ? getString('pipelineSteps.backendConfig')
              : getString('cd.configurationFile')
          }
        </Label>
      )}
      {getMultiTypeFromValue(config?.workspace) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${path}.spec.configuration.workspace`}
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
            template={template}
            fieldPath={`${path}.spec.configuration.workspace`}
          />
        </div>
      )}
      {getMultiTypeFromValue(configSpec?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            selected={get(initialValues, `${configPath}.store.spec.connectorRef`, '')}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            multiTypeProps={{ allowableTypes, expressions }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
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
      {getMultiTypeFromValue(configSpec?.spec?.repoName) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            label={getString('pipelineSteps.repoName')}
            name={`${path}.${configPath}.store.spec.repoName`}
            placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            template={template}
            fieldPath={`${path}.${configPath}.store.spec.repoName`}
          />
        </div>
      )}

      {getMultiTypeFromValue(configSpec?.spec?.branch) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            label={getString('pipelineSteps.deploy.inputSet.branch')}
            name={`${path}.${configPath}.store.spec.branch`}
            placeholder={getString('pipeline.manifestType.branchPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            template={template}
            fieldPath={`${path}.${configPath}.store.spec.branch`}
          />
        </div>
      )}

      {getMultiTypeFromValue(configSpec?.spec?.commitId) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            label={getString('pipeline.manifestType.commitId')}
            name={`${path}.${configPath}.store.spec.commitId`}
            placeholder={getString('pipeline.manifestType.commitPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            template={template}
            fieldPath={`${path}.${configPath}.store.spec.commitId`}
          />
        </div>
      )}

      {getMultiTypeFromValue(configSpec?.spec?.folderPath) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            label={getString('common.git.folderPath')}
            name={`${path}.${configPath}.store.spec.folderPath`}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            template={template}
            fieldPath={`${path}.${configPath}.store.spec.folderPath`}
          />
        </div>
      )}

      {
        /* istanbul ignore next */ configSpec?.type === 'Harness' &&
          getMultiTypeFromValue(configSpec?.spec?.files) === MultiTypeInputType.RUNTIME && (
            <Layout.Vertical className={cx(stepCss.inputWidth, stepCss.layoutVerticalSpacing)}>
              <FileStoreList
                name={`${path}.${configPath}.store.spec.files`}
                type={fileTypes.FILE_STORE}
                allowOnlyOne={true}
                formik={formik}
              />
            </Layout.Vertical>
          )
      }

      {
        /* istanbul ignore next */ configSpec?.type === 'Harness' &&
          getMultiTypeFromValue(configSpec?.spec?.secretFiles) === MultiTypeInputType.RUNTIME && (
            <Layout.Vertical className={cx(stepCss.inputWidth, stepCss.layoutVerticalSpacing)}>
              <FileStoreList
                name={`${path}.${configPath}.store.spec.secretFiles`}
                type={fileTypes.ENCRYPTED}
                allowOnlyOne={true}
                formik={formik}
              />
            </Layout.Vertical>
          )
      }
    </>
  )
}

const TgPlanConfigSection = connect(ConfigSectionRef)
export default TgPlanConfigSection

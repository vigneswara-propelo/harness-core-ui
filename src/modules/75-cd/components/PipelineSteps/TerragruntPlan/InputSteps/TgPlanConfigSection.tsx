/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { Label } from '@harness/uicore'
import { connect } from 'formik'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { isValueRuntimeInput } from '@common/utils/utils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import type { TerragruntPlanProps } from '../../Common/Terragrunt/TerragruntInterface'
import { getPath } from '../../Common/ConfigFileStore/ConfigFileStoreHelper'
import css from '../../Common/Terraform/TerraformStep.module.scss'

function ConfigSectionRef(props: TerragruntPlanProps & { formik?: any }): React.ReactElement {
  const { getString } = useStrings()

  const { inputSetData, readonly, initialValues, path, allowableTypes, stepViewType, isBackendConfig } = props
  const template = inputSetData?.template
  const configPath = getPath(false, true, isBackendConfig, 'configuration')
  const configSpec = get(template, `${configPath}.store`)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  return (
    <>
      {configSpec?.spec && (
        <Label className={css.label}>
          {
            /* istanbul ignore next */ isBackendConfig
              ? getString('pipelineSteps.backendConfig')
              : getString('cd.configurationFile')
          }
        </Label>
      )}

      {isValueRuntimeInput(configSpec?.spec?.connectorRef) && (
        <FormMultiTypeConnectorField
          accountIdentifier={accountId}
          selected={get(initialValues, `${configPath}.store.spec.connectorRef`, '')}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ allowableTypes, expressions, newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          type={configSpec?.type}
          name={`${path}.${configPath}.store.spec.connectorRef`}
          label={getString('connector')}
          placeholder={getString('select')}
          disabled={readonly}
          setRefValue
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
      )}

      {isValueRuntimeInput(configSpec?.spec?.repoName) && (
        <TextFieldInputSetView
          label={getString('pipelineSteps.repoName')}
          name={`${path}.${configPath}.store.spec.repoName`}
          placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath={`${configPath}.store.spec.repoName`}
        />
      )}

      {isValueRuntimeInput(configSpec?.spec?.branch) && (
        <TextFieldInputSetView
          label={getString('pipelineSteps.deploy.inputSet.branch')}
          name={`${path}.${configPath}.store.spec.branch`}
          placeholder={getString('pipeline.manifestType.branchPlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath={`${configPath}.store.spec.branch`}
        />
      )}

      {isValueRuntimeInput(configSpec?.spec?.commitId) && (
        <TextFieldInputSetView
          label={getString('pipeline.manifestType.commitId')}
          name={`${path}.${configPath}.store.spec.commitId`}
          placeholder={getString('pipeline.manifestType.commitPlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath={`${configPath}.store.spec.commitId`}
        />
      )}

      {isValueRuntimeInput(configSpec?.spec?.folderPath) && (
        <TextFieldInputSetView
          label={getString('common.git.folderPath')}
          name={`${path}.${configPath}.store.spec.folderPath`}
          placeholder={getString('pipeline.manifestType.pathPlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath={`${configPath}.store.spec.folderPath`}
        />
      )}
    </>
  )
}

const TgPlanConfigSection = connect(ConfigSectionRef)
export default TgPlanConfigSection

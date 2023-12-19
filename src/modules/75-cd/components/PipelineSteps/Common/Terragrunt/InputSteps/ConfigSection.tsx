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
import { connect, FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { isValueRuntimeInput } from '@common/utils/utils'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import type { TerragruntData, TerragruntProps } from '../TerragruntInterface'
import { getPath } from '../../ConfigFileStore/ConfigFileStoreHelper'
import css from '../../Terraform/TerraformStep.module.scss'

function ConfigSectionRef<T extends TerragruntData>(
  props: TerragruntProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { inputSetData, readonly, initialValues, path, allowableTypes, isBackendConfig, stepViewType } = props
  const template = inputSetData?.template
  const configPath = getPath(false, false, isBackendConfig, 'configuration')
  const configSpec = get(template, configPath)
  const store = configSpec?.store
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const isRepoRuntime = isValueRuntimeInput(store?.spec?.repoName)

  return (
    <>
      {store?.spec && (
        <Label className={css.label}>
          {isBackendConfig ? getString('pipelineSteps.backendConfig') : getString('cd.configurationFile')}
        </Label>
      )}

      {isValueRuntimeInput(store?.spec?.connectorRef) && (
        <FormMultiTypeConnectorField
          accountIdentifier={accountId}
          selected={get(initialValues, `${configPath}.store.spec.connectorRef`, '')}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ allowableTypes, expressions, newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT }}
          width={388}
          type={store?.type}
          name={`${path}.${configPath}.store.spec.connectorRef`}
          label={getString('connector')}
          placeholder={getString('select')}
          disabled={readonly}
          setRefValue
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
      )}

      {isRepoRuntime && (
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
          template={inputSetData?.template}
          fieldPath={`${configPath}.store.spec.repoName`}
        />
      )}

      {isValueRuntimeInput(store?.spec?.branch) && (
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

      {isValueRuntimeInput(store?.spec?.commitId) && (
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

      {isValueRuntimeInput(store?.spec?.folderPath) && (
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

const ConfigSection = connect(ConfigSectionRef)
export default ConfigSection

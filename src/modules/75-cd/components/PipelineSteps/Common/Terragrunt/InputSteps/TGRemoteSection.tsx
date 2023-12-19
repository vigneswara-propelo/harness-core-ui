/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { connect, FormikContextType } from 'formik'
import { Container, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import List from '@pipeline/components/List/List'
import { isValueRuntimeInput } from '@common/utils/utils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import type { TerragruntData, TerragruntProps } from '../TerragruntInterface'

function TgRemoteSectionRef<T extends TerragruntData>(
  props: TerragruntProps<T> & {
    remoteVar: any
    index: number
    formik?: FormikContextType<any>
  }
): React.ReactElement {
  const { remoteVar, index, allowableTypes, readonly, initialValues, path, inputSetData, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const template = inputSetData?.template
  const isRepoRuntime = isValueRuntimeInput(get(remoteVar.varFile, 'spec.store.spec.repoName'))

  return (
    <>
      <Container flex width={150}>
        <Text font={{ weight: 'bold' }}>{getString('cd.varFile')}:</Text>
        {remoteVar.varFile?.identifier}
      </Container>

      {isValueRuntimeInput(get(remoteVar.varFile, 'spec.store.spec.connectorRef')) && (
        <FormMultiTypeConnectorField
          accountIdentifier={accountId}
          selected={get(
            initialValues,
            `${path}.configuration?.spec?.varFiles[${index}].varFile.spec.store.spec.connectorRef`,
            ''
          )}
          multiTypeProps={{ allowableTypes, expressions }}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={388}
          type={[remoteVar.varFile?.spec?.store?.type]}
          name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.connectorRef`}
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
          name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.repoName`}
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
          fieldPath={`spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.repoName`}
        />
      )}

      {isValueRuntimeInput(get(remoteVar.varFile, 'spec.store.spec.branch')) && (
        <TextFieldInputSetView
          name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.branch`}
          label={getString('pipelineSteps.deploy.inputSet.branch')}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath={`spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.branch`}
        />
      )}
      {isValueRuntimeInput(get(remoteVar.varFile, 'spec.store.spec.commitId')) && (
        <TextFieldInputSetView
          name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.commitId`}
          label={getString('pipeline.manifestType.commitId')}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath={`spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.commitId`}
        />
      )}
      {isValueRuntimeInput(get(remoteVar.varFile, 'spec.store.spec.paths')) && (
        <List
          label={getString('filePaths')}
          name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.paths`}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
          isNameOfArrayType
        />
      )}
    </>
  )
}

const TgRemoteSection = connect(TgRemoteSectionRef)
export default TgRemoteSection

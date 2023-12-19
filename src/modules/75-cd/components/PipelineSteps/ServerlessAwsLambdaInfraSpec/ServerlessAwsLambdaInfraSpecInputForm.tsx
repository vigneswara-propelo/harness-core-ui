/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import { Layout, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'

import type { ExecutionElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ServerlessInfraTypes } from '@pipeline/utils/stageHelpers'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import ProvisionerSelectField from '@pipeline/components/Provisioner/ProvisionerSelect'
import { connectorTypes } from '@pipeline/utils/constants'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ServerlessInfraSpec.module.scss'

export interface ServerlessAwsLambdaInfraSpecInputFormProps {
  readonly?: boolean
  template?: ServerlessInfraTypes
  allowableTypes: AllowedTypes
  provisioner?: ExecutionElementConfig['steps']
  path: string
}

export const ServerlessAwsLambdaInfraSpecInputForm: React.FC<ServerlessAwsLambdaInfraSpecInputFormProps> = ({
  template,
  readonly = false,
  path,
  allowableTypes,
  provisioner
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const connectorFieldName = isEmpty(path) ? 'connectorRef' : `${path}.connectorRef`
  const regionFieldName = isEmpty(path) ? 'region' : `${path}.region`
  const stageFieldName = isEmpty(path) ? 'stage' : `${path}.stage`
  const provisionerName = isEmpty(path) ? 'provisioner' : `${path}.provisioner`

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(template?.provisioner) === MultiTypeInputType.RUNTIME && provisioner && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <ProvisionerSelectField name={provisionerName} path={path} provisioners={provisioner} />
        </div>
      )}
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            tooltipProps={{
              dataTooltipId: 'awsInfraConnector'
            }}
            name={connectorFieldName}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('common.entityPlaceholderText')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions, newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT }}
            type={connectorTypes.Aws}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: template?.connectorRef
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={regionFieldName}
          disabled={readonly}
          placeholder={getString('cd.steps.serverless.regionPlaceholder')}
          label={getString('regionLabel')}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          template={template}
          fieldPath={'region'}
          className={cx(stepCss.formGroup, stepCss.md, css.regionInputWrapper)}
        />
      )}
      {getMultiTypeFromValue(template?.stage) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={stageFieldName}
          label={getString('common.stage')}
          disabled={readonly}
          multiTextInputProps={{
            allowableTypes,
            expressions,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          placeholder={getString('cd.steps.serverless.stagePlaceholder')}
          template={template}
          fieldPath={'stage'}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
    </Layout.Vertical>
  )
}

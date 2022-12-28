/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'

import { getMultiTypeFromValue, MultiTypeInputType, FormikForm, Text } from '@harness/uicore'

import { get, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { connect, FormikContextType } from 'formik'
import type { TerraformBackendConfigSpec } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components'
import List from '@common/components/List/List'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import TgPlanConfigSection from './TgPlanConfigSection'
import TgPlanVarFiles from './TgPlanVarFiles'
import type { TerragruntPlanProps } from '../../Common/Terragrunt/TerragruntInterface'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function TgPlanInputStep(props: TerragruntPlanProps & { formik?: FormikContextType<any> }): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, initialValues, allowableTypes, stepViewType } = props
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  return (
    <FormikForm>
      {getMultiTypeFromValue(inputSetData?.template?.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.provisionerIdentifier`}
            placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
            label={getString('pipelineSteps.provisionerIdentifier')}
            disabled={readonly}
            fieldPath={'spec.provisionerIdentifier'}
            template={inputSetData?.template}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TimeoutFieldInputSetView
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            disabled={readonly}
            fieldPath={'timeout'}
            template={inputSetData?.template}
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.secretManagerRef) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            label={getString('connectors.title.secretManager')}
            accountIdentifier={accountId}
            selected={get(initialValues, 'spec.configuration.secretManagerRef', '')}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            width={400}
            multiTypeProps={{ allowableTypes, expressions }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            category={'SECRET_MANAGER'}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.configuration.secretManagerRef`}
            placeholder={getString('select')}
            disabled={readonly}
            setRefValue
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      <TgPlanConfigSection {...props} />
      {inputSetData?.template?.spec?.configuration?.varFiles &&
      inputSetData?.template?.spec?.configuration?.varFiles?.length > 0 ? (
        <TgPlanVarFiles {...props} />
      ) : null}
      {
        /* istanbul ignore next */
        getMultiTypeFromValue(
          (inputSetData?.template?.spec?.configuration?.backendConfig?.spec as TerraformBackendConfigSpec)?.content
        ) === MultiTypeInputType.RUNTIME && (
          <div
            className={cx(stepCss.formGroup, stepCss.md)}
            // needed to prevent the run pipeline to get triggered on pressing enter within TFMonaco editor
            onKeyDown={e => {
              e.stopPropagation()
            }}
          >
            <MultiTypeFieldSelector
              name={`${
                isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
              }spec.configuration.backendConfig.spec.content`}
              label={getString('cd.backEndConfig')}
              defaultValueToReset=""
              allowedTypes={allowableTypes}
              skipRenderValueInExpressionLabel
              disabled={readonly}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
              expressionRender={
                /* istanbul ignore next */ () => {
                  return (
                    <MonacoTextField
                      name={`${
                        isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
                      }spec.configuration.backendConfig.spec.content`}
                      expressions={expressions}
                      height={300}
                      disabled={readonly}
                      fullScreenAllowed
                      fullScreenTitle={getString('tagsLabel')}
                    />
                  )
                }
              }
            >
              <MonacoTextField
                name={`${
                  isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
                }spec.configuration.backendConfig.spec.content`}
                expressions={expressions}
                height={300}
                disabled={readonly}
                fullScreenAllowed
                fullScreenTitle={getString('tagsLabel')}
              />
            </MultiTypeFieldSelector>
          </div>
        )
      }
      <TgPlanConfigSection isBackendConfig={true} {...props} />

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.targets as string) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <List
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.configuration.targets`}
            label={<Text style={{ display: 'flex', alignItems: 'center' }}>{getString('pipeline.targets.title')}</Text>}
            disabled={readonly}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.exportTerragruntPlanJson) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            name={`${
              isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
            }spec.configuration.exportTerraformPlanJson`}
            label={getString('cd.exportTerraformPlanJson')}
            multiTypeTextbox={{ expressions, allowableTypes }}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
          />
        </div>
      )}
    </FormikForm>
  )
}

const TerragruntPlanInputStep = connect(TgPlanInputStep)
export default TerragruntPlanInputStep

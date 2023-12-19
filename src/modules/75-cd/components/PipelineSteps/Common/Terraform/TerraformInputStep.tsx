/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { get, isEmpty } from 'lodash-es'
import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  Text,
  Label,
  FormInput,
  Container,
  Icon
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { FormikContextType, useFormikContext } from 'formik'
import { useParams } from 'react-router-dom'

import type {
  TerraformBackendConfigSpec,
  TerraformCliOptionFlag,
  TerraformStepConfiguration,
  TerraformVarFileWrapper
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import List from '@pipeline/components/List/List'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { isValueRuntimeInput } from '@common/utils/utils'
import { FormMultiTypeCheckboxField } from '@common/components'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useQueryParams } from '@common/hooks'
import { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { TerraformData, TerraformProps, TerraformStoreTypes } from './TerraformInterfaces'
import ConfigInputs from './InputSteps/ConfigSection'
import TFRemoteSection from './InputSteps/TFRemoteSection'
import { TFMonaco } from './Editview/TFMonacoEditor'
import InlineVarFileInputSet from '../VarFile/InlineVarFileInputSet'
import TerraformSelectArn from './TerraformSelectArn/TerraformSelectArn'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function TerraformInputStep<T extends TerraformData = TerraformData>(
  props: TerraformProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, path, allowableTypes, onUpdate, onChange, stepViewType } = props
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()
  /* istanbul ignore next */
  const onUpdateRef = (arg: TerraformData): void => {
    onUpdate?.(arg as T)
  }
  /* istanbul ignore next */
  const onChangeRef = (arg: TerraformData): void => {
    onChange?.(arg as T)
  }
  const formik = useFormikContext()
  const fieldPath = inputSetData?.template?.spec?.configuration ? 'configuration' : 'cloudCliConfiguration'
  const inputSetDataSpec = get(inputSetData?.template?.spec, `${fieldPath}`)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const checkArnInput = React.useMemo((): boolean => {
    const existRuntimeArnField = ['connectorRef', 'region', 'roleArn'].some(field => {
      return (
        getMultiTypeFromValue(
          get(inputSetData?.template?.spec, `${fieldPath}.spec.providerCredential.spec.${field}`)
        ) === MultiTypeInputType.RUNTIME
      )
    })
    return existRuntimeArnField
  }, [inputSetData, fieldPath])

  return (
    <FormikForm className={stepCss.inputWidth}>
      {getMultiTypeFromValue((inputSetData?.template as TerraformData)?.spec?.provisionerIdentifier) ===
        MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${path}.spec.provisionerIdentifier`}
          placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
          label={getString('pipelineSteps.provisionerIdentifier')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          fieldPath={'spec.provisionerIdentifier'}
          template={inputSetData?.template}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          disabled={readonly}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: readonly,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          fieldPath={'timeout'}
          template={inputSetData?.template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}

      <ConfigInputs {...props} onUpdate={onUpdateRef} onChange={onChangeRef} isConfig />
      {inputSetDataSpec?.spec?.varFiles?.length && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {getString('cd.terraformVarFiles')}
        </Label>
      )}
      {inputSetDataSpec?.spec?.varFiles?.map((varFile: TerraformVarFileWrapper, index: number) => {
        if (varFile?.varFile?.type === TerraformStoreTypes.Inline) {
          return (
            <InlineVarFileInputSet<TerraformVarFileWrapper>
              readonly={readonly}
              stepViewType={stepViewType}
              allowableTypes={allowableTypes}
              varFilePath={`${path}.spec.${fieldPath}.spec.varFiles[${index}]`}
              inlineVarFile={varFile}
            />
          )
        } else if (varFile.varFile?.type === TerraformStoreTypes.Remote) {
          return (
            <TFRemoteSection
              remoteVar={varFile}
              index={index}
              {...props}
              onUpdate={onUpdateRef}
              onChange={onChangeRef}
            />
          )
        }
        return <></>
      })}

      {getMultiTypeFromValue(get(inputSetData?.template?.spec, `${fieldPath}.spec.workspace`)) ===
        MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${path}.spec.configuration.spec.workspace`}
          placeholder={getString('pipeline.terraformStep.workspace')}
          label={getString('pipelineSteps.workspace')}
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
          fieldPath={'spec.configuration.spec.workspace'}
        />
      )}
      {checkArnInput && (
        <TerraformSelectArn
          pathName={`${path}.spec.${fieldPath}.spec`}
          allowableTypes={allowableTypes}
          allValues={props?.allValues as TerraformData}
          fieldPath={`spec.${fieldPath}.spec.providerCredential.spec`}
          renderConnector={
            getMultiTypeFromValue(
              get(inputSetData?.template?.spec, `${fieldPath}.spec.providerCredential.spec.connectorRef`)
            ) === MultiTypeInputType.RUNTIME
          }
          renderRegion={
            getMultiTypeFromValue(
              get(inputSetData?.template?.spec, `${fieldPath}.spec.providerCredential.spec.region`)
            ) === MultiTypeInputType.RUNTIME
          }
          renderRole={
            getMultiTypeFromValue(
              get(inputSetData?.template?.spec, `${fieldPath}.spec.providerCredential.spec.roleArn`)
            ) === MultiTypeInputType.RUNTIME
          }
        />
      )}

      {getMultiTypeFromValue((inputSetDataSpec?.spec?.backendConfig as TerraformBackendConfigSpec)?.spec?.content) ===
        MultiTypeInputType.RUNTIME && (
        <div
          // needed to prevent the run pipeline to get triggered on pressing enter within TFMonaco editor
          onKeyDown={e => {
            e.stopPropagation()
          }}
        >
          <MultiTypeFieldSelector
            name={`${path}.spec.${fieldPath}.spec.backendConfig.spec.content`}
            label={getString('cd.backEndConfig')}
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={readonly}
            expressionRender={() => {
              /* istanbul ignore next */
              return (
                <TFMonaco
                  name={`${path}.spec.${fieldPath}.spec.backendConfig.spec.content`}
                  formik={formik!}
                  expressions={expressions}
                  title={getString('tagsLabel')}
                />
              )
            }}
          >
            <TFMonaco
              name={`${path}.spec.${fieldPath}.spec.backendConfig.spec.content`}
              formik={formik!}
              expressions={expressions}
              title={getString('tagsLabel')}
            />
          </MultiTypeFieldSelector>
        </div>
      )}

      <ConfigInputs {...props} isBackendConfig={true} onUpdate={onUpdateRef} onChange={onChangeRef} />

      {getMultiTypeFromValue(inputSetDataSpec?.spec?.targets as string) === MultiTypeInputType.RUNTIME && (
        <List
          name={`${path}.spec.${fieldPath}.spec.targets`}
          label={<Text style={{ display: 'flex', alignItems: 'center' }}>{getString('pipeline.targets.title')}</Text>}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
          expressions={expressions}
          isNameOfArrayType
        />
      )}

      {isValueRuntimeInput((inputSetDataSpec as TerraformStepConfiguration)?.skipRefreshCommand) && (
        <FormMultiTypeCheckboxField
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.configuration.skipRefreshCommand`}
          label={getString('cd.skipRefreshCommand')}
          multiTypeTextbox={{ expressions, allowableTypes, newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT }}
          enableConfigureOptions={true}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
        />
      )}

      {isValueRuntimeInput((inputSetDataSpec as TerraformStepConfiguration)?.skipStateStorage) && (
        <FormMultiTypeCheckboxField
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.configuration.skipStateStorage`}
          label={getString('cd.skipStateStorage')}
          multiTypeTextbox={{ expressions, allowableTypes, newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT }}
          enableConfigureOptions={true}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
        />
      )}

      {inputSetDataSpec?.commandFlags?.map((terraformCommandFlag: TerraformCliOptionFlag, terraformFlagIdx: number) => {
        if (
          isValueRuntimeInput(get(inputSetData?.template, `spec.${fieldPath}.commandFlags[${terraformFlagIdx}].flag`))
        ) {
          return (
            <div key={terraformFlagIdx}>
              <FormInput.MultiTextInput
                name={`${
                  isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
                }spec.${fieldPath}.commandFlags[${terraformFlagIdx}].flag`}
                multiTextInputProps={{
                  expressions,
                  allowableTypes,
                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                }}
                label={`${terraformCommandFlag.commandType}: ${getString('flag')}`}
              />
            </div>
          )
        }
      })}

      {isValueRuntimeInput((inputSetDataSpec as any)?.encryptOutput?.outputSecretManagerRef) && (
        <Container flex>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            category={'SECRET_MANAGER'}
            setRefValue
            orgIdentifier={orgIdentifier}
            name={`${
              isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
            }spec.${fieldPath}.encryptOutput.outputSecretManagerRef`}
            tooltipProps={{
              dataTooltipId: 'outputSecretManagerRef'
            }}
            label={getString('optionalField', { name: getString('cd.encryptJsonOutput') })}
            enableConfigureOptions={false}
            placeholder={getString('select')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions, newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT }}
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          />
          <Icon
            name="remove"
            onClick={() => {
              formik?.setFieldValue(
                `${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.${fieldPath}.encryptOutput`,
                undefined
              )
            }}
            margin={{ left: 'medium', top: 'medium' }}
            size={24}
          />
        </Container>
      )}
    </FormikForm>
  )
}

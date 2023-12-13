/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/icons'
import type { FormikErrors } from 'formik'
import React from 'react'
import { defaultTo } from 'lodash-es'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StringsMap } from 'stringTypes'
import { VariableListTableProps, VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { flatObject } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalCommons'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { CreateCatalogStepData, CreateCatalogStepEditWithRef } from './CreateCatalogStepEdit'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './CreateCatalogStepFunctionConfigs'
import CreateCatalogStepInputSet from './CreateCatalogStepInputSet'
import { getFormValuesInCorrectFormat } from '../utils'

const defaultFileContentYaml =
  'apiVersion: backstage.io/v1alpha1\nkind: Component\nmetadata:\n  name: <+pipeline.vars.project_name>\n  description: <+pipeline.vars.description>\n  annotations:\n    backstage.io/techdocs-ref: dir:.\nspec:\n  type: service\n  owner: <+pipeline.vars.owners>\n  lifecycle: experimental'
export class CreateCatalogStep extends PipelineStep<CreateCatalogStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
  }

  protected type = StepType.CreateCatalog
  protected stepName = 'CreateCatalog'
  protected stepIcon: IconName = 'script'
  protected stepDescription: keyof StringsMap = 'idp.createCatalogStep.createCatalogStepDescription'
  protected stepPaletteVisible = false
  protected defaultValues: CreateCatalogStepData = {
    type: StepType.CreateCatalog,
    identifier: '',
    spec: {
      fileName: '',
      filePath: '',
      fileContent: defaultFileContentYaml
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): CreateCatalogStepData {
    return getFormValuesInCorrectFormat<T, CreateCatalogStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<CreateCatalogStepData>): FormikErrors<CreateCatalogStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<CreateCatalogStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      onChange,
      allowableTypes
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <CreateCatalogStepInputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={onUpdate}
          onChange={onChange}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <VariablesListTable
          data={flatObject(defaultTo(initialValues, {}))}
          originalData={initialValues}
          metadataMap={(customStepProps as Pick<VariableListTableProps, 'metadataMap'>)?.metadataMap}
        />
      )
    }

    return (
      <CreateCatalogStepEditWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}

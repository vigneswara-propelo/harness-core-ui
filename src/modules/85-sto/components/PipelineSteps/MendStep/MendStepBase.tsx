/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm } from '@harness/uicore'
import { Divider } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { CIStep } from '@ci/components/PipelineSteps/CIStep/CIStep'
import { useGetPropagatedStageById } from '@ci/components/PipelineSteps/CIStep/StepUtils'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './MendStepFunctionConfigs'
import type { MendStepProps, MendStepData } from './MendStep'
import {
  AdditionalFields,
  SecurityAuthFields,
  SecurityImageFields,
  SecurityIngestionFields,
  SecurityScanFields,
  SecurityTargetFields
} from '../SecurityFields'
import {
  INGESTION_SCAN_MODE,
  ORCHESTRATION_SCAN_MODE,
  EXTRACTION_SCAN_MODE,
  REPOSITORY_TARGET_TYPE,
  dividerBottomMargin
} from '../constants'
import SecurityField from '../SecurityField'

export const MendStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, allowableTypes, onChange }: MendStepProps,
  formikRef: StepFormikFowardRef<MendStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const valuesInCorrectFormat = getInitialValuesInCorrectFormat<MendStepData, MendStepData>(
    initialValues,
    transformValuesFieldsConfig(initialValues),
    { imagePullPolicyOptions: getImagePullPolicyOptions(getString) }
  )

  return (
    <Formik
      initialValues={valuesInCorrectFormat}
      formName="MendStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<MendStepData, MendStepData>(
          valuesToValidate,
          transformValuesFieldsConfig(valuesToValidate)
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          editViewValidateFieldsConfig(valuesToValidate),
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: MendStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<MendStepData, MendStepData>(
          _values,
          transformValuesFieldsConfig(_values)
        )

        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<MendStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              stepViewType={stepViewType}
              allowableTypes={allowableTypes}
              enableFields={{
                name: {},
                description: {}
              }}
              formik={formik}
            />

            <SecurityScanFields
              allowableTypes={allowableTypes}
              formik={formik}
              stepViewType={stepViewType}
              scanConfigReadonly
              scanModeSelectItems={[ORCHESTRATION_SCAN_MODE, EXTRACTION_SCAN_MODE, INGESTION_SCAN_MODE]}
            />

            <SecurityTargetFields
              allowableTypes={allowableTypes}
              formik={formik}
              stepViewType={stepViewType}
              targetTypeSelectItems={[REPOSITORY_TARGET_TYPE]}
            />

            <SecurityImageFields allowableTypes={allowableTypes} formik={formik} stepViewType={stepViewType} />

            <SecurityIngestionFields allowableTypes={allowableTypes} formik={formik} stepViewType={stepViewType} />

            <SecurityAuthFields
              showFields={{
                access_id: true,
                ssl: true,
                domain: true
              }}
              allowableTypes={allowableTypes}
              formik={formik}
              stepViewType={stepViewType}
            />
            {/* <DropDown
              onChange={(item)=>{ 
                setLookupType(item.value as lookupTypeValues)
              }
              }
              value={lookupType}
              items={getLookupTypes()} /> */}
            <>
              <SecurityField
                stepViewType={stepViewType}
                allowableTypes={allowableTypes}
                formik={formik}
                enableFields={{
                  'spec.tool.include': {
                    label: 'sto.stepField.toolInclude',
                    optional: true,
                    hide: !(formik.values.spec.mode === 'orchestration' || formik.values.spec.mode === 'extraction')
                  },
                  'spec.tool.product_token': {
                    label: 'sto.stepField.tool.productToken',
                    hide: !(formik.values.spec.mode === 'orchestration' || formik.values.spec.mode === 'extraction')
                  },
                  'spec.tool.product_name': {
                    label: 'sto.stepField.tool.productName',
                    hide: !(formik.values.spec.mode === 'orchestration' || formik.values.spec.mode === 'extraction')
                  },
                  'spec.tool.project_token': {
                    label: 'sto.stepField.tool.projectToken',
                    hide: formik.values.spec.mode !== 'extraction'
                  },
                  'spec.tool.project_name': {
                    label: 'projectCard.projectName',
                    hide: formik.values.spec.mode !== 'extraction',
                    optional: true
                  }
                }}
              />
              <Divider style={{ marginBottom: dividerBottomMargin }} />
            </>

            <AdditionalFields
              readonly={readonly}
              currentStage={currentStage}
              stepViewType={stepViewType}
              allowableTypes={allowableTypes}
              formik={formik}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const MendStepBaseWithRef = React.forwardRef(MendStepBase)

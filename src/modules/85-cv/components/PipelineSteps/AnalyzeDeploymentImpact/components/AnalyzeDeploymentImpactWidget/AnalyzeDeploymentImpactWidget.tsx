/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from '@harness/uicore'

import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { AnalyzeDeploymentImpactWidgetProps } from './types'
import { AnalyzeDeploymentImpactWidgetSections } from './components/AnalyzeDeploymentImpactWidgetSections/AnalyzeDeploymentImpactWidgetSections'
// import { validateMonitoredService } from './AnalyzeDeploymentImpactWidget.utils'
import { AnalyzeDeploymentImpactData } from '../../AnalyzeDeploymentImpact.types'

export function AnalyzeDeploymentImpactWidget(
  {
    initialValues,
    onUpdate,
    isNewStep,
    stepViewType,
    // onChange,
    allowableTypes
  }: AnalyzeDeploymentImpactWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()

  // const validateForm = (formData: AnalyzeDeploymentImpactData): FormikErrors<AnalyzeDeploymentImpactData> => {
  //   const { healthSources, monitoredService } = formData.spec
  //   const monitoredServiceRef = monitoredService.spec.monitoredServiceRef as string
  //   return validateMonitoredService(monitoredServiceRef, getString, healthSources)
  // }

  const defaultAnalyzeSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: Yup.string().required(getString('connectors.cdng.validations.timeoutValidation')),
    spec: Yup.object().shape({
      duration: Yup.string().required(getString('connectors.cdng.validations.durationRequired'))
    })
  })

  return (
    <Formik<AnalyzeDeploymentImpactData>
      onSubmit={/* istanbul ignore next */ data => onUpdate?.(data)}
      validate={() => {
        // This will be added in the next PR.
        // const errors = validateForm(data)
        // if (!isEmpty(errors)) {
        //   onChange?.(data)
        //   return errors
        // } else {
        //   onChange?.(data)
        // }
      }}
      formName="analyzeStep"
      initialValues={initialValues}
      validationSchema={defaultAnalyzeSchema}
    >
      {(formik: FormikProps<AnalyzeDeploymentImpactData>) => {
        setFormikRef(formikRef, formik)
        return (
          <AnalyzeDeploymentImpactWidgetSections
            formik={formik}
            isNewStep={isNewStep}
            stepViewType={stepViewType}
            allowableTypes={allowableTypes}
          />
        )
      }}
    </Formik>
  )
}

export const AnalyzeDeploymentImpactWidgetWithRef = React.forwardRef(AnalyzeDeploymentImpactWidget)

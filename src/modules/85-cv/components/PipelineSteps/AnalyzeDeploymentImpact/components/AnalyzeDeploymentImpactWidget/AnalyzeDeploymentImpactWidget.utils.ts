/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { FormikErrors, FormikProps } from 'formik'
import type { StringKeys } from 'framework/strings'
import { AnalyzeDeploymentImpactData } from '../../AnalyzeDeploymentImpact.types'

export function healthSourcesValidation(
  monitoredServiceRef: string | undefined,
  healthSources: { identifier: string }[] | undefined,
  getString: (key: StringKeys) => string,
  errors: FormikErrors<AnalyzeDeploymentImpactData>
): FormikErrors<AnalyzeDeploymentImpactData> {
  if (
    monitoredServiceRef !== RUNTIME_INPUT_VALUE &&
    !isAnExpression(monitoredServiceRef as string) &&
    monitoredServiceRef &&
    !healthSources?.length
  ) {
    errors['spec'] = {
      ...errors['spec'],
      healthSources: getString('connectors.cdng.validations.healthSourceRequired')
    }
  }
  return errors
}

export function monitoredServiceRefValidation(
  monitoredServiceRef: string | undefined
): FormikErrors<AnalyzeDeploymentImpactData> {
  const errors: FormikErrors<AnalyzeDeploymentImpactData> = {}
  if (!monitoredServiceRef) {
    errors['spec'] = {
      monitoredService: {
        spec: {
          monitoredServiceRef: 'Monitored service is required'
        }
      }
    }
  }
  return errors
}

export function validateMonitoredService(
  monitoredServiceRef: string,
  getString: (key: StringKeys) => string,
  healthSources?: { identifier: string }[]
): FormikErrors<AnalyzeDeploymentImpactData> {
  let errors: FormikErrors<AnalyzeDeploymentImpactData> = {}
  errors = monitoredServiceRefValidation(monitoredServiceRef)
  errors = healthSourcesValidation(monitoredServiceRef, healthSources, getString, errors)
  return errors
}

export function resetFormik(
  formValues: AnalyzeDeploymentImpactData,
  newSpecs: AnalyzeDeploymentImpactData['spec'],
  formik: FormikProps<AnalyzeDeploymentImpactData>
): void {
  const formNewValues = { ...formValues, spec: newSpecs }
  formik.resetForm({ values: formNewValues })
}

export const isAnExpression = (value: string): boolean => {
  return value?.startsWith('<+') || (value?.startsWith('<') && value !== RUNTIME_INPUT_VALUE)
}

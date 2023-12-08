/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import { FormikContextType } from 'formik'
import { MonitoredServiceType } from '../../MonitoredServiceOverview.constants'

export interface OrgAccountLevelServiceEnvFieldProps {
  isTemplate: boolean
  isInputSet?: boolean
  serviceOnSelect: (service: SelectOption) => void
  environmentOnSelect: (environment: SelectOption) => void
  noHeaderLabel?: boolean
}

export interface FormValues {
  type: ValueOf<typeof MonitoredServiceType>
  serviceRef?: string
  environmentRef?: string
}
export interface WrapperOrgAccountLevelServiceEnvFieldProps {
  isTemplate: boolean
  isInputSet?: boolean
  serviceOnSelect: (service: SelectOption) => void
  environmentOnSelect: (environment: SelectOption) => void
  formikProps?: FormikContextType<FormValues>
}

export interface onChangeProps {
  // type is any in the parent onChange
  value: any
  isTemplate: boolean
  onSuccess:
    | OrgAccountLevelServiceEnvFieldProps['serviceOnSelect']
    | OrgAccountLevelServiceEnvFieldProps['environmentOnSelect']
}

export interface ServiceEnvModalProps {
  service: {
    isModalOpen: boolean
    closeModal: () => void
    onSelect: OrgAccountLevelServiceEnvFieldProps['serviceOnSelect']
  }
  environment: {
    isModalOpen: boolean
    closeModal: () => void
    onSelect: OrgAccountLevelServiceEnvFieldProps['environmentOnSelect']
  }
}

export interface ShouldShowServiceEnvironmentFieldProps {
  isInputSet?: boolean
  serviceRef?: string | null
  environmentRef?: string | null
}

export interface ShouldShowServiceEnvironmentFieldValues {
  showService: boolean
  showEnvironment: boolean
}

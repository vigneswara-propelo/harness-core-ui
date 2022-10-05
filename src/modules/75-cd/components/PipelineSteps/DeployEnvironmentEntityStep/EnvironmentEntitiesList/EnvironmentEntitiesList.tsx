/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Spinner } from '@blueprintjs/core'

import { AllowedTypes, Container } from '@harness/uicore'

import type { EnvironmentYaml } from 'services/cd-ng'

import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  EnvironmentData
} from '../types'
import { EnvironmentEntityCard } from './EnvironmentEntityCard'

export interface EnvironmentEntitiesListProps extends Required<DeployEnvironmentEntityCustomStepProps> {
  loading: boolean
  environmentsData: EnvironmentData[]
  readonly: boolean
  allowableTypes: AllowedTypes
  onEnvironmentEntityUpdate?: (id: string) => void
  onRemoveEnvironmentFromList?: (val: EnvironmentYaml) => void
  initialValues: DeployEnvironmentEntityFormState
}

export default function EnvironmentEntitiesList({
  loading,
  environmentsData,
  readonly,
  allowableTypes,
  stageIdentifier,
  deploymentType,
  gitOpsEnabled,
  initialValues
}: EnvironmentEntitiesListProps): React.ReactElement {
  const [environmentToEdit, setEnvironmentToEdit] = React.useState<EnvironmentData | null>(null)
  const [environmentToDelete, setEnvironmentToDelete] = React.useState<EnvironmentData | null>(null)

  useEffect(() => {
    return
  }, [environmentToEdit, environmentToDelete])

  if (loading) {
    return <Spinner />
  }

  return (
    <Container>
      {environmentsData.map(row => {
        return (
          <EnvironmentEntityCard
            key={row.environment.identifier}
            environment={row.environment}
            environmentInputs={row.environmentInputs}
            onDeleteClick={setEnvironmentToDelete}
            onEditClick={setEnvironmentToEdit}
            allowableTypes={allowableTypes}
            readonly={readonly}
            stageIdentifier={stageIdentifier}
            gitOpsEnabled={gitOpsEnabled}
            deploymentType={deploymentType}
            initialValues={initialValues}
          />
        )
      })}
    </Container>
  )
}

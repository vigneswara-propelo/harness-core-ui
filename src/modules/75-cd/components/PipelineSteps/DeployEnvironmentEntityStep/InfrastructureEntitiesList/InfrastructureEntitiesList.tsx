/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Spinner } from '@blueprintjs/core'

import { AllowedTypes, Container } from '@harness/uicore'

import type { DeployEnvironmentEntityCustomStepProps, InfrastructureData, InfrastructureYaml } from '../types'
import { InfrastructureEntityCard } from './InfrastructureEntityCard'

export interface InfrastructureEntitiesListProps
  extends Required<Pick<DeployEnvironmentEntityCustomStepProps, 'stageIdentifier'>> {
  loading: boolean
  infrastructuresData: InfrastructureData[]
  readonly: boolean
  allowableTypes: AllowedTypes
  environmentIdentifier: string
  onInfrastructureEntityUpdate?: (id: string) => void
  onRemoveInfrastructureFromList?: (val: InfrastructureYaml) => void
}

export default function InfrastructureEntitiesList({
  loading,
  infrastructuresData,
  readonly,
  allowableTypes,
  environmentIdentifier,
  stageIdentifier
}: InfrastructureEntitiesListProps): React.ReactElement {
  const [infrastructureToEdit, setInfrastructureToEdit] = React.useState<InfrastructureData | null>(null)
  const [infrastructureToDelete, setInfrastructureToDelete] = React.useState<InfrastructureData | null>(null)

  useEffect(() => {
    return
  }, [infrastructureToEdit, infrastructureToDelete])

  if (loading) {
    return <Spinner />
  }

  return (
    <Container>
      {infrastructuresData.map(row => {
        return (
          <InfrastructureEntityCard
            key={row.infrastructureDefinition.identifier}
            infrastructureDefinition={row.infrastructureDefinition}
            infrastructureInputs={row.infrastructureInputs}
            onDeleteClick={setInfrastructureToDelete}
            onEditClick={setInfrastructureToEdit}
            allowableTypes={allowableTypes}
            readonly={readonly}
            stageIdentifier={stageIdentifier}
            environmentIdentifier={environmentIdentifier}
          />
        )
      })}
    </Container>
  )
}

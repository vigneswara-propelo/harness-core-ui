/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { Collapse } from '@blueprintjs/core'

import {
  ButtonVariation,
  Card,
  Text,
  Color,
  AllowedTypes,
  Container,
  Layout,
  TagsPopover,
  Button,
  ButtonSize
} from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'

import type { InfrastructureData } from '../types'
import type { DeployServiceEntityCustomProps } from '../../DeployServiceEntityStep/DeployServiceEntityUtils'

import css from './InfrastructureEntitiesList.module.scss'

export interface InfrastructureEntityCardProps extends InfrastructureData, DeployServiceEntityCustomProps {
  readonly: boolean
  allowableTypes: AllowedTypes
  onEditClick: (infrastructure: InfrastructureData) => void
  onDeleteClick: (infrastructure: InfrastructureData) => void
  environmentIdentifier: string
}

export function InfrastructureEntityCard({
  infrastructureDefinition,
  infrastructureInputs,
  readonly,
  onEditClick,
  onDeleteClick
}: InfrastructureEntityCardProps): React.ReactElement {
  const { getString } = useStrings()
  const { name, identifier, tags } = infrastructureDefinition

  const [showInputs, setShowInputs] = useState(false)

  function toggle(): void {
    setShowInputs(show => !show)
  }

  return (
    <Card className={css.card}>
      <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Layout.Vertical>
          <Layout.Horizontal
            flex={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
            spacing="small"
            margin={{ bottom: 'xsmall' }}
          >
            <Text color={Color.PRIMARY_7}>{name}</Text>
            {!isEmpty(tags) && (
              <TagsPopover iconProps={{ size: 14, color: Color.GREY_600 }} tags={defaultTo(tags, {})} />
            )}
          </Layout.Horizontal>

          <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
            {getString('common.ID')}: {identifier}
          </Text>
        </Layout.Vertical>

        <Container>
          <RbacButton
            variation={ButtonVariation.ICON}
            icon="edit"
            data-testid={`edit-infrastructure-${identifier}`}
            disabled={readonly}
            onClick={() => onEditClick({ infrastructureDefinition, infrastructureInputs })}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT,
                resourceIdentifier: identifier
              },
              permission: PermissionIdentifier.EDIT_ENVIRONMENT
            }}
          />
          <RbacButton
            variation={ButtonVariation.ICON}
            icon="remove-minus"
            data-testid={`delete-infrastructure-${identifier}`}
            disabled={readonly}
            onClick={() => onDeleteClick({ infrastructureDefinition, infrastructureInputs })}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT,
                resourceIdentifier: identifier
              },
              permission: PermissionIdentifier.DELETE_ENVIRONMENT
            }}
          />
        </Container>
      </Layout.Horizontal>
      {infrastructureInputs ? (
        <>
          <Container flex={{ justifyContent: 'center' }}>
            <Button
              icon={showInputs ? 'chevron-up' : 'chevron-down'}
              data-testid="toggle-infrastructure-inputs"
              text={getString(
                showInputs
                  ? 'cd.pipelineSteps.environmentTab.hideInfrastructureInputs'
                  : 'cd.pipelineSteps.environmentTab.viewInfrastructureInputs'
              )}
              variation={ButtonVariation.LINK}
              size={ButtonSize.SMALL}
              onClick={toggle}
            />
          </Container>
          <Collapse keepChildrenMounted={false} isOpen={showInputs}>
            <Container border={{ top: true }}>
              <Text color={Color.GREY_800} font={{ size: 'normal', weight: 'bold' }} margin={{ bottom: 'medium' }}>
                {getString('common.infrastructureInputs')} Please ask Ashwin to update infra inputs, if he is not
                already on it
              </Text>
            </Container>
          </Collapse>
        </>
      ) : null}
    </Card>
  )
}

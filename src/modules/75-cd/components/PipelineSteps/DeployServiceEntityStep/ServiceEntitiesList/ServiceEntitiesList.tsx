/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd'
import cx from 'classnames'
import { cloneDeep, defaultTo, pick } from 'lodash-es'
import { useToggleOpen, ConfirmationDialog, AllowedTypes, ModalDialog, SelectOption } from '@harness/uicore'
import type { ModalDialogProps } from '@harness/uicore/dist/components/ModalDialog/ModalDialog'
import { Intent } from '@harness/design-system'
import { Spinner } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import ServiceEntityEditModal from '@cd/components/Services/ServiceEntityEditModal/ServiceEntityEditModal'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { DeploymentMetaData, ServiceYaml } from 'services/cd-ng'

import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'
import { StoreMetadata } from '@modules/10-common/constants/GitSyncTypes'
import type { FormState, ServiceData } from '../DeployServiceEntityUtils'
import { ServiceEntityCard } from './ServiceEntityCard'
import css from './ServiceEntitiesList.module.scss'

const DIALOG_PROPS: Omit<ModalDialogProps, 'isOpen'> = {
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  lazy: true,
  className: css.editServiceDialog,
  height: 840,
  width: 1114
}

export interface ServiceEntitiesListProps {
  loading: boolean
  servicesData: ServiceData[]
  selectedDeploymentType?: ServiceDeploymentType
  gitOpsEnabled?: boolean
  deploymentMetadata?: DeploymentMetaData
  onRemoveServiceFormList(id: string): void
  readonly?: boolean
  stageIdentifier?: string
  allowableTypes: AllowedTypes
  onServiceEntityUpdate: (val: ServiceYaml) => void
  isPropogateFromStage: boolean
}

export function ServiceEntitiesList(props: ServiceEntitiesListProps): React.ReactElement {
  const {
    loading,
    servicesData,
    gitOpsEnabled,
    deploymentMetadata,
    onRemoveServiceFormList,
    selectedDeploymentType,
    readonly,
    stageIdentifier,
    onServiceEntityUpdate,
    allowableTypes,
    isPropogateFromStage
  } = props
  const { getString } = useStrings()
  const { values, setFieldValue } = useFormikContext<FormState>()
  const { accountId } = useParams<PipelinePathProps>()

  const [serviceToEdit, setServiceToEdit] = React.useState<ServiceData | null>(null)
  const [serviceToDelete, setServiceToDelete] = React.useState<ServiceData | null>(null)
  const {
    isOpen: isDeleteConfirmationOpen,
    open: openDeleteConfirmation,
    close: closeDeleteConfirmation
  } = useToggleOpen()

  React.useEffect(() => {
    if (serviceToDelete) {
      openDeleteConfirmation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceToDelete])

  function handleDeleteConfirmation(confirmed: boolean): void {
    if (serviceToDelete && confirmed) {
      onRemoveServiceFormList(getScopedValueFromDTO(serviceToDelete.service))
    }
    closeDeleteConfirmation()
    onCloseEditModal()
  }

  function onCloseEditModal(): void {
    setServiceToEdit(null)
  }

  function handleServiceEntityUpdate(val: ServiceYaml): void {
    onCloseEditModal()
    onServiceEntityUpdate(val)
  }

  function onDragEnd(result: DropResult): void {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    if (sourceIndex === destinationIndex) return

    const servicesList = cloneDeep(values.services) as SelectOption[]
    const itemToMove = servicesList.splice(sourceIndex, 1)
    servicesList.splice(destinationIndex, 0, itemToMove[0])

    setFieldValue('services', servicesList)
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={'serviceDropper'}>
          {(provided, snapshot) => {
            return (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={cx(css.cardsContainer, { [css.draggingOver]: snapshot.isDraggingOver })}
              >
                {servicesData.map((row, index: number) => {
                  const serviceStoreMetadata: StoreMetadata = {
                    storeType: row?.storeType,
                    connectorRef: row?.connectorRef,
                    repoName: row?.entityGitDetails?.repoName
                  }
                  return (
                    <ServiceEntityCard
                      key={row.service.identifier}
                      service={row.service}
                      serviceInputs={row.serviceInputs}
                      onDeleteClick={setServiceToDelete}
                      onEditClick={setServiceToEdit}
                      stageIdentifier={stageIdentifier}
                      allowableTypes={allowableTypes}
                      readonly={readonly}
                      deploymentType={selectedDeploymentType}
                      isPropogateFromStage={isPropogateFromStage}
                      cardClassName={servicesData.length - 1 !== index ? css.marginBottom : ''}
                      serviceIndex={index}
                      storeMetadata={serviceStoreMetadata}
                      entityGitDetails={row?.entityGitDetails}
                    />
                  )
                })}
              </div>
            )
          }}
        </Droppable>
      </DragDropContext>
      <ModalDialog
        isOpen={!!serviceToEdit}
        onClose={onCloseEditModal}
        title={getString('editService')}
        {...DIALOG_PROPS}
      >
        <ServiceEntityEditModal
          selectedDeploymentType={defaultTo(
            serviceToEdit?.service.serviceDefinition?.type as ServiceDeploymentType,
            selectedDeploymentType
          )}
          serviceResponse={
            serviceToEdit
              ? {
                  ...serviceToEdit.service,
                  accountId,
                  ...pick(serviceToEdit, ['storeType', 'connectorRef', 'entityGitDetails'])
                }
              : undefined
          }
          onCloseModal={onCloseEditModal}
          onServiceCreate={handleServiceEntityUpdate}
          isServiceCreateModalView={false}
          gitOpsEnabled={gitOpsEnabled}
          deploymentMetadata={deploymentMetadata}
        />
      </ModalDialog>
      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        titleText={getString('cd.pipelineSteps.serviceTab.deleteServiceFromListTitleText')}
        contentText={getString('cd.pipelineSteps.serviceTab.deleteServiceFromListText', {
          name: serviceToDelete?.service.name
        })}
        confirmButtonText={getString('applyChanges')}
        cancelButtonText={getString('cancel')}
        onClose={handleDeleteConfirmation}
        intent={Intent.WARNING}
      />
    </>
  )
}

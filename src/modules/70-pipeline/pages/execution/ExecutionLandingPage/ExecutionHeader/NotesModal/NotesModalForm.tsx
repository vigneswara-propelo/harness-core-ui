/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { TextArea } from '@blueprintjs/core'
import { Button, Text, Layout, ButtonVariation, Container } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { HideModal } from '@harness/use-modal'
import { PipelineExecutionSummary } from 'services/pipeline-ng'
import { AccountPathProps, ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings, String } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import RbacButton from '@rbac/components/Button/Button'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import css from './NotesModalForm.module.scss'

interface NotesModalFormProps {
  notes: string
  pipelineExecutionSummary: PipelineExecutionSummary
  loading: boolean
  updateNotes: (note: string) => void
  onClose: HideModal
}
function NotesModalForm({
  notes,
  pipelineExecutionSummary,
  updateNotes,
  loading,
  onClose
}: NotesModalFormProps): JSX.Element {
  const { module, accountId, projectIdentifier, orgIdentifier } = useParams<
    ProjectPathProps & AccountPathProps & ModulePathParams
  >()
  const permission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.PIPELINE,
      resourceIdentifier: pipelineExecutionSummary?.pipelineIdentifier
    }
  }

  const { getString } = useStrings()
  const [canEdit] = usePermission(
    /* istanbul ignore next */
    {
      ...permission,
      permissions: [PermissionIdentifier.EXECUTE_PIPELINE]
    },
    [pipelineExecutionSummary?.pipelineIdentifier]
  )

  const [note, setNote] = useState(notes)
  const disableApply = notes === note

  React.useEffect(() => {
    notes && setNote(notes)
  }, [notes])

  const handleApply = (): void => {
    updateNotes(note)
  }

  return (
    <Layout.Vertical>
      <Layout.Vertical className={css.header}>
        <Text font={{ variation: FontVariation.H3 }} color={Color.BLACK} margin={{ bottom: 'small' }} lineClamp={1}>
          {pipelineExecutionSummary.name}
        </Text>
        <String
          tagName="div"
          className={css.pipelineId}
          stringID={
            module === 'ci' /*istanbul ignore next */
              ? 'execution.pipelineIdentifierTextCI' /*istanbul ignore next */
              : 'execution.pipelineIdentifierTextCD'
          }
          vars={pipelineExecutionSummary}
        />
      </Layout.Vertical>

      <Layout.Horizontal padding={{ top: 'medium', bottom: 'small' }}>
        <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_700} padding={{ right: 'xsmall' }}>
          {getString('common.note')}
        </Text>
        {canEdit && (
          <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_500}>
            {getString('common.optionalLabel')}
          </Text>
        )}
      </Layout.Horizontal>

      <Container padding={{ top: 'medium' }} width="100%" className={css.notesInput}>
        {loading ? (
          /* istanbul ignore next */
          <ContainerSpinner />
        ) : (
          <TextArea
            disabled={!canEdit}
            value={note}
            data-testid="note-input"
            onChange={event => setNote(event.target.value)}
            placeholder={`${getString('pipeline.executionNotes.addNote')} ${
              canEdit ? getString('common.optionalLabel') : ''
            }`}
          />
        )}
      </Container>

      <Layout.Horizontal padding={{ top: 'xlarge' }}>
        <RbacButton
          variation={ButtonVariation.PRIMARY}
          onClick={handleApply}
          intent="primary"
          margin={{ right: 'small' }}
          disabled={disableApply}
          permission={{
            ...permission,
            permission: PermissionIdentifier.EXECUTE_PIPELINE
          }}
        >
          {getString('common.apply')}
        </RbacButton>
        <Button variation={ButtonVariation.TERTIARY} onClick={onClose}>
          {getString('cancel')}
        </Button>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default NotesModalForm

/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Layout, Page, Popover, Text, useConfirmationDialog } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Classes, Position, Intent } from '@blueprintjs/core'
import { useParams, useHistory } from 'react-router-dom'
import { useToaster } from '@common/exports'
import { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
// eslint-disable-next-line no-restricted-imports
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import routes from '@common/RouteDefinitionsV2'
import { String, useStrings } from 'framework/strings'
// eslint-disable-next-line no-restricted-imports
import RbacAvatarGroup from '@rbac/components/RbacAvatarGroup/RbacAvatarGroup'
// eslint-disable-next-line no-restricted-imports
import { ResourceType } from '@rbac/interfaces/ResourceType'
// eslint-disable-next-line no-restricted-imports
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { Organization, Project, ResponseOrganizationAggregateDTO, useDeleteOrganization } from 'services/cd-ng'
// eslint-disable-next-line no-restricted-imports
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
// eslint-disable-next-line no-restricted-imports
import { DeleteProjectOrgButtons } from '@projects-orgs/pages/projects/DeleteProject'
// eslint-disable-next-line no-restricted-imports
import { useOrganizationModal } from '@projects-orgs/modals/OrganizationModal/useOrganizationModal'
// eslint-disable-next-line no-restricted-imports
import { useCollaboratorModal } from '@projects-orgs/modals/ProjectModal/useCollaboratorModal'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import OrgPopoverMenu from './OrgPopoverMenu'
import css from './SettingsPages.module.scss'

interface OrgHeaderProps {
  data: ResponseOrganizationAggregateDTO | null
  refetch: () => Promise<unknown>
}

const OrgHeader = (props: OrgHeaderProps): React.ReactElement => {
  const { data, refetch } = props
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, orgIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { mutate: deleteOrg, loading } = useDeleteOrganization({ queryParams: { accountIdentifier: accountId } })
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const [menuOpen, setMenuOpen] = useState(false)
  const organization = data?.data?.organizationResponse.organization
  const { openCollaboratorModal } = useCollaboratorModal()

  const projectCreateSuccessHandler = (projectData?: Project): void => {
    if (projectData) {
      history.push(routes.toProjectDetails({ accountId, orgIdentifier, projectIdentifier: projectData.identifier }))
    }
  }
  const { openProjectModal, closeProjectModal } = useProjectModal({
    onSuccess: projectCreateSuccessHandler,
    onWizardComplete: projectData => {
      closeProjectModal()
      projectCreateSuccessHandler(projectData)
    }
  })

  const invitePermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier
    },
    resource: {
      resourceType: ResourceType.USER
    },
    permission: PermissionIdentifier.INVITE_USER
  }

  const { openOrganizationModal } = useOrganizationModal({
    onSuccess: () => refetch()
  })

  const onDeleteAction = async (): Promise<void> => {
    try {
      const deleted = await deleteOrg(organization?.identifier || '', {
        headers: { 'content-type': 'application/json' }
      })
      /* istanbul ignore else */ if (deleted)
        // eslint-disable-next-line strings-restrict-modules
        showSuccess(getString('projectsOrgs.orgDeletedMessage', { name: organization?.name }))
      history.push(routes.toOrgs({ accountId }))
    } catch (err) {
      showError(getRBACErrorMessage(err))
    } finally {
      closeDialog()
    }
  }

  const { openDialog, closeDialog } = useConfirmationDialog({
    contentText: (
      <String
        // eslint-disable-next-line strings-restrict-modules
        stringID="projectsOrgs.confirmDelete"
        vars={{
          name: organization?.name
        }}
        useRichText={true}
      />
    ),
    // eslint-disable-next-line strings-restrict-modules
    titleText: getString('projectsOrgs.confirmDeleteTitle'),
    intent: Intent.DANGER,
    customButtons: (
      <DeleteProjectOrgButtons
        onCancel={() => {
          closeDialog()
        }}
        name={organization?.name || ''}
        onDelete={onDeleteAction}
        disableDeleteBtn={loading}
        // eslint-disable-next-line strings-restrict-modules
        inputLabel={getString('projectsOrgs.toConfirmOrg')}
        // eslint-disable-next-line strings-restrict-modules
        inputPlaceholder={getString('projectsOrgs.toDelete', { name: getString('orgLabel') })}
        // eslint-disable-next-line strings-restrict-modules
        confirmBtnLabel={getString('projectsOrgs.confirmDeleteProjectOrg', {
          type: getString('orgLabel').toLowerCase()
        })}
      />
    ),
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        onDeleteAction()
      }
    }
  })

  return (
    <>
      <Page.Header
        className={css.pageHeader}
        size="xlarge"
        toolbar={
          <Layout.Vertical padding={'large'} flex={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Popover
              isOpen={menuOpen}
              onInteraction={nextOpenState => {
                setMenuOpen(nextOpenState)
              }}
              className={Classes.DARK}
              position={Position.BOTTOM_RIGHT}
            >
              <Button
                minimal
                icon="options-hollow"
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(true)
                }}
              />
              <OrgPopoverMenu
                org={organization as Organization}
                setMenuOpen={setMenuOpen}
                inviteCollab={() => openCollaboratorModal({ orgIdentifier: orgIdentifier })}
                editOrg={() => openOrganizationModal(organization as Organization)}
                openDialog={openDialog}
              />
            </Popover>
            <Layout.Horizontal padding={{ top: 'xlarge', right: 'huge' }}>
              <Layout.Vertical spacing="xsmall" flex>
                <Text font="xsmall" padding={{ bottom: 'xsmall' }}>
                  {getString('adminLabel')}
                </Text>
                <RbacAvatarGroup
                  avatars={data?.data?.admins?.length ? data.data.admins : [{}]}
                  onAdd={event => {
                    event.stopPropagation()
                    openCollaboratorModal({ orgIdentifier: orgIdentifier })
                  }}
                  restrictLengthTo={6}
                  permission={invitePermission}
                />
              </Layout.Vertical>
              <Layout.Vertical padding={{ right: 'large' }} spacing="xsmall" flex>
                <Text font="xsmall" padding={{ bottom: 'xsmall' }}>
                  {getString('collaboratorsLabel')}
                </Text>
                <RbacAvatarGroup
                  avatars={data?.data?.collaborators?.length ? data.data.collaborators : [{}]}
                  onAdd={event => {
                    event.stopPropagation()
                    openCollaboratorModal({ orgIdentifier: orgIdentifier })
                  }}
                  restrictLengthTo={6}
                  permission={invitePermission}
                />
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Vertical>
        }
        title={
          organization ? (
            <Layout.Vertical spacing="small" className={css.title} padding="xlarge">
              <NGBreadcrumbs />
              <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_700}>
                {getString('common.settingsPage.title.orgSettingsTitleWithName', { name: organization.name })}
              </Text>
              {organization.description && (
                <Text font={{ variation: FontVariation.SMALL }} lineClamp={2} color={Color.GREY_600}>
                  {organization.description}
                </Text>
              )}

              <Layout.Horizontal padding={{ top: 'small' }} style={{ gap: 'var(--spacing-medium)' }}>
                {Object.keys(organization?.tags ?? {}).length !== 0 && (
                  <>
                    <TagsRenderer tags={organization?.tags ?? {}} length={6} />
                    {' | '}
                  </>
                )}

                <Layout.Horizontal spacing="xsmall">
                  <Text color={Color.BLACK} font={{ variation: FontVariation.BODY2 }}>
                    {getString('projectsText')}:
                  </Text>
                  <Text color={Color.BLACK} font={{ variation: FontVariation.BODY }}>
                    {data?.data?.projectsCount}
                  </Text>
                  <Text flex>
                    {'( '}
                    <Text
                      color={Color.PRIMARY_7}
                      font={{ variation: FontVariation.BODY }}
                      onClick={() => openProjectModal()}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* eslint-disable-next-line strings-restrict-modules */}
                      {getString('projectsOrgs.createAProject')}
                    </Text>
                    {' )'}
                  </Text>
                </Layout.Horizontal>
              </Layout.Horizontal>
            </Layout.Vertical>
          ) : (
            getString('common.settingsPage.title.orgSettingsTitle')
          )
        }
      />
    </>
  )
}

export default OrgHeader

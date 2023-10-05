/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Layout, Page, Popover, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Classes, Position } from '@blueprintjs/core'
import { isEmpty } from 'lodash-es'
import ReactTimeago from 'react-timeago'
import { useParams, useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import RbacAvatarGroup from '@rbac/components/RbacAvatarGroup/RbacAvatarGroup'
import routes from '@common/RouteDefinitionsV2'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { Project, ResponseProjectAggregateDTO } from 'services/cd-ng'
import { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import FavoriteStar from '@common/components/FavoriteStar/FavoriteStar'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useCollaboratorModal } from '@projects-orgs/modals/ProjectModal/useCollaboratorModal'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import useDeleteProjectDialog from '@projects-orgs/pages/projects/DeleteProject'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import PopoverMenu from './PopoverMenu'
import css from '@common/pages/SettingsPages/SettingsPages.module.scss'

interface ProjectsHeaderProps {
  data: ResponseProjectAggregateDTO | null
  refetch: () => Promise<unknown>
}

const ProjectsHeader = (props: ProjectsHeaderProps): React.ReactElement => {
  const { data, refetch } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const [menuOpen, setMenuOpen] = useState(false)
  const { PL_FAVORITES } = useFeatureFlags()
  const { openCollaboratorModal } = useCollaboratorModal()
  const history = useHistory()

  const project = data?.data?.projectResponse.project

  const showCollaborators = (): void => {
    openCollaboratorModal({
      projectIdentifier: project?.identifier,
      orgIdentifier: project?.orgIdentifier || 'default'
    })
  }

  const invitePermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.USER
    },
    permission: PermissionIdentifier.INVITE_USER
  }

  const onDeleted = (): void => {
    history.push(routes.toProjects())
  }

  const refetchProject = (): void => {
    refetch()
  }

  const { openProjectModal } = useProjectModal({
    onSuccess: refetchProject
  })

  const editProject = (selectedProject: Project): void => {
    openProjectModal(selectedProject)
  }

  const { openDialog } = useDeleteProjectDialog(project || { identifier: '', name: '' }, onDeleted)

  return (
    <>
      <Page.Header
        className={css.pageHeader}
        size={project?.description || !isEmpty(project?.tags) ? 'xxlarge' : 'xlarge'}
        toolbar={
          <Layout.Vertical padding={'xlarge'} flex={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
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
              <PopoverMenu
                project={project as Project}
                reloadProjects={refetch}
                setMenuOpen={setMenuOpen}
                refetch={refetch}
                collaborators={showCollaborators}
                editProject={editProject}
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
                    showCollaborators()
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
                    showCollaborators()
                  }}
                  restrictLengthTo={6}
                  permission={invitePermission}
                />
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Vertical>
        }
        title={
          project ? (
            <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
              {PL_FAVORITES && (
                <>
                  <FavoriteStar
                    isFavorite={data?.data?.projectResponse.isFavorite}
                    resourceId={project.identifier}
                    resourceType="PROJECT"
                    className={css.favorite}
                    scope={{ orgIdentifier: project.orgIdentifier }}
                  />
                  <div className={css.stardivider} />
                </>
              )}
              <Layout.Vertical
                spacing="small"
                className={css.title}
                padding={{ top: 'large', bottom: 'large', left: 'medium' }}
              >
                <Layout.Vertical>
                  <NGBreadcrumbs />
                  <Layout.Horizontal
                    style={{ gap: 'var(--spacing-medium)' }}
                    flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                    padding={{ top: 'small' }}
                  >
                    <div className={css.colorBar} style={{ backgroundColor: project?.color }} />
                    <Text color={Color.GREY_400} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
                      {getString('idLabel', { id: project?.identifier })}
                    </Text>

                    <div className={css.headDivider} />
                    {data?.data?.projectResponse.lastModifiedAt ? (
                      <Text color={Color.GREY_400} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
                        {`${getString('common.modified')} `}
                        <ReactTimeago date={data?.data?.projectResponse.lastModifiedAt} />
                      </Text>
                    ) : null}
                  </Layout.Horizontal>
                </Layout.Vertical>

                <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_900} lineClamp={1}>
                  {project.name}
                </Text>
                {project.description && (
                  <Text font={{ variation: FontVariation.SMALL }} lineClamp={2} color={Color.BLACK}>
                    {project.description}
                  </Text>
                )}

                <Layout.Horizontal padding={{ top: 'small' }} style={{ gap: 'var(--spacing-medium)' }}>
                  {Object.keys(project?.tags ?? {}).length !== 0 && (
                    <>
                      <TagsRenderer tags={project?.tags ?? {}} length={6} />
                    </>
                  )}
                </Layout.Horizontal>
              </Layout.Vertical>
            </Layout.Horizontal>
          ) : (
            getString('common.settingsPage.title.projectSettingsTitle')
          )
        }
      />
    </>
  )
}

export default ProjectsHeader

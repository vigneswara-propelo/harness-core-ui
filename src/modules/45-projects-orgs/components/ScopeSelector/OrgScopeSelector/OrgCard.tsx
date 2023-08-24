/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Card, Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { OrganizationAggregateDTO } from 'services/cd-ng'

import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { useStrings } from 'framework/strings'
import RbacAvatarGroup from '@rbac/components/RbacAvatarGroup/RbacAvatarGroup'
import css from './OrgScopeSelector.module.scss'

interface OrganizationCardProps {
  data: OrganizationAggregateDTO
  onClick?: () => void
  selected?: boolean
  className?: string
  hideAddOption?: boolean
}

export const OrganizationCard: React.FC<OrganizationCardProps> = props => {
  const { data: organizationAggregateDTO, onClick, selected } = props
  const {
    organizationResponse: { organization: data },
    projectsCount,
    admins,
    collaborators
  } = organizationAggregateDTO
  const orgMembers = admins?.concat(collaborators || [])

  const { getString } = useStrings()

  return (
    <Card
      elevation={3}
      className={cx(css.orgCard, props.className)}
      onClick={onClick}
      selected={selected}
      interactive
      data-testid={`org-card-${data.identifier}`}
    >
      <Container padding="large" className={css.orgInfo}>
        <Layout.Vertical className={css.title}>
          <Text font={{ variation: FontVariation.FORM_TITLE }} color={Color.GREY_700} lineClamp={1}>
            {data?.name || getString('projectsOrgs.orgName')}
          </Text>
          <Layout.Horizontal className={css.description}>
            {data?.description ? (
              <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }} lineClamp={2}>
                {data.description}
              </Text>
            ) : null}
          </Layout.Horizontal>
          <Container className={css.tagsContainer}>
            {data.tags && Object.keys(data.tags).length > 0 && (
              <TagsRenderer tags={data.tags} className={css.tags} length={2} tagClassName={css.tagText} />
            )}
          </Container>
          <Layout.Horizontal padding={{ top: 'large' }} flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
            <Layout.Vertical spacing="small">
              <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_500}>
                {getString('projectsText')}
              </Text>
              <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
                <Icon name="nav-project" size={24} />
                <Text font={{ variation: FontVariation.FORM_TITLE }} color={Color.PRIMARY_7}>
                  {projectsCount}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
            <Layout.Vertical padding={{ left: 'xxlarge' }} spacing="small">
              <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_500}>
                {getString('collaboratorsLabel')}
              </Text>
              <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <RbacAvatarGroup
                  size="small"
                  avatars={orgMembers?.length ? orgMembers : [{}]}
                  restrictLengthTo={2}
                  hideAddOption={props.hideAddOption}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Container>
    </Card>
  )
}

/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { CardSelect, HarnessDocTooltip, Icon, IconName, Layout, Page, PageSpinner, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { defaultTo, get } from 'lodash-es'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { ProjectAggregateDTO, useGetProjectAggregateDTOList } from 'services/cd-ng'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import routes from '@common/RouteDefinitions'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { StringKeys, useStrings } from 'framework/strings'
import CreateIDPProject from './CreateIDPProject'
import css from './IDPProjectSetup.module.scss'

interface CardSelectInterface {
  label: StringKeys
  value: string
  icon: IconName
}

const cards: CardSelectInterface[] = [
  {
    label: 'idp.chooseProject',
    value: 'choose',
    icon: 'chaos-cube'
  },
  {
    label: 'idp.createProject',
    value: 'create',
    icon: 'cube-add'
  }
]

function IDPProjectSetup(): React.ReactElement {
  const params = useParams<AccountPathProps>()
  const { selectedProject, updateAppStore } = useAppStore()
  const module = 'idp-admin'
  const history = useHistory()
  const { getString } = useStrings()

  const [selectedCard, setSelectedCard] = useState(cards[0])

  const { data, loading: isLoading } = useGetProjectAggregateDTOList({
    queryParams: {
      accountIdentifier: params.accountId,
      orgIdentifier: '',
      searchTerm: ''
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' }
  })

  /* istanbul ignore next */
  if (isLoading) {
    return <PageSpinner />
  }

  return (
    <>
      <Page.Header
        title={
          <div className="ng-tooltip-native">
            <h2 data-tooltip-id="projectSetup">{getString('common.projectSetup')}</h2>
            <HarnessDocTooltip tooltipId="projectSetup" useStandAlone={true} />
          </div>
        }
        breadcrumbs={<NGBreadcrumbs links={[{ url: routes.toPluginsPage(params), label: getString('adminLabel') }]} />}
      ></Page.Header>

      <Page.Body className={css.pagebody}>
        <Text font={{ variation: FontVariation.H3 }}>{getString('idp.createChooseProject')}</Text>
        <CardSelect
          data={cards}
          cornerSelected
          className={css.cardSelect}
          renderItem={(item: CardSelectInterface) => (
            <Layout.Horizontal flex={{ justifyContent: 'center' }} width={200} spacing="small">
              <Icon name={item.icon} size={30} flex />
              <Text font={{ variation: FontVariation.SMALL_SEMI }} width={78}>
                {getString(item.label)}
              </Text>
            </Layout.Horizontal>
          )}
          selected={selectedCard}
          onChange={card => setSelectedCard(card)}
        />
        {selectedCard.value === 'choose' ? (
          get(data, 'data.content').map((projectAggregate: ProjectAggregateDTO) => (
            <ProjectCard
              key={projectAggregate.projectResponse.project.identifier}
              data={projectAggregate}
              minimal={true}
              selected={
                /* istanbul ignore next */
                projectAggregate.projectResponse.project.identifier === selectedProject?.identifier &&
                projectAggregate.projectResponse.project.orgIdentifier === selectedProject?.orgIdentifier
              }
              className={cx(css.projectCard, Classes.POPOVER_DISMISS)}
              onClick={() => {
                updateAppStore({ selectedProject: projectAggregate.projectResponse.project })
                history.push(
                  routes.toPipelines({
                    accountId: params.accountId,
                    orgIdentifier: defaultTo(projectAggregate.projectResponse.project.orgIdentifier, ''),
                    module,
                    projectIdentifier: projectAggregate.projectResponse.project.identifier
                  })
                )
              }}
            />
          ))
        ) : (
          <CreateIDPProject />
        )}
      </Page.Body>
    </>
  )
}

export default IDPProjectSetup

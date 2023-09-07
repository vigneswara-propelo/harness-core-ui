/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Switch } from '@blueprintjs/core'
import {
  Button,
  Carousel,
  Icon,
  Layout,
  Text,
  Container,
  ButtonVariation,
  getErrorInfoFromErrorObject,
  PageError,
  DropDown,
  SelectOption,
  useToaster,
  CardSelect
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import {
  ArtifactInstanceDetail,
  ChartVersionInstanceDetail,
  EnvironmentGroupInstanceDetail,
  GetArtifactInstanceDetailsQueryParams,
  GetEnvironmentInstanceDetailsQueryParams,
  setCustomSequenceStatusPromise,
  useGetArtifactInstanceDetails,
  useGetChartVersionInstanceDetails,
  useGetCustomSequenceStatus,
  useGetEnvironmentInstanceDetails
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useMutateAsGet } from '@common/hooks'
import { CardInterface } from '@common/components/InlineRemoteSelect/InlineRemoteSelect'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { EntityType } from '@common/pages/entityUsage/EntityConstants'
import { useServiceContext } from '@cd/context/ServiceContext'
import { EnvCardViewEmptyState } from './ServiceDetailEmptyStates'
import ServiceDetailsDialog from './ServiceDetailsDialog'
import {
  CardSortOption,
  CardView,
  createGroups,
  EnvCardProps,
  ServiceDetailsCardViewProps,
  shouldShowChartVersion
} from './ServiceDetailUtils'
import { EnvCard } from './ServiceDetailCardViews/ServiceDetailEnvCardView'
import { ArtifactCard } from './ServiceDetailCardViews/ServiceDetailArtifactCardView'
import CustomSequenceDrawer from './CustomSequence/CustomSequence'
import { ChartVersionCard } from './ServiceDetailCardViews/ServiceDetailChartVersionCardView'
import css from './ServiceDetailsSummaryV2.module.scss'

const sortFilterParam = (sortFilter: string): string[] => {
  return sortFilter === CardSortOption.ALL ? [CardSortOption.PROD, CardSortOption.PRE_PROD] : [sortFilter]
}

export function ServiceDetailsCardView(props: ServiceDetailsCardViewProps): React.ReactElement {
  const { setEnvId, setArtifactName, setChartVersionName } = props
  const { selectedDeploymentType } = useServiceContext()
  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()
  const [selectedEnv, setSelectedEnv] = useState<{ envId?: string; isEnvGroup: boolean }>()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const [activeSlide, setActiveSlide] = useState<number>(1)
  const [cardView, setCardView] = useState(CardView.ENV)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false)
  const [envFilter, setEnvFilter] = useState<{
    envId?: string
    isEnvGroup: boolean
  }>({
    envId: undefined,
    isEnvGroup: false
  })

  //artifact state
  const [selectedArtifact, setSelectedArtifact] = useState<string>()
  const [artifactFilter, setArtifactFilter] = useState<string | undefined>('')
  const [artifactFilterApplied, setArtifactFilterApplied] = useState(false)

  // Chart Version state
  const [selectedChartVersion, setSelectedChartVersion] = useState<string>()
  const [chartVersionFilter, setChartVersionFilter] = useState<string | undefined>('')
  const [chartVersionFilterApplied, setChartVersionFilterApplied] = useState(false)

  //filter
  const [sortOptions, setSortOptions] = useState<CardSortOption>(CardSortOption.ALL)

  const queryParams: GetEnvironmentInstanceDetailsQueryParams | GetArtifactInstanceDetailsQueryParams = {
    accountIdentifier: accountId,
    serviceId,
    orgIdentifier,
    projectIdentifier
  }

  const {
    data: getCustomSeqStatus,
    loading: getCustomSeqLoading,
    refetch: refetchCustomSeqStatus
  } = useGetCustomSequenceStatus({ queryParams })

  //custom sequencing
  const [isCustomSeqDrawerOpen, setCustomSeqDrawerOpen] = React.useState<boolean>(false)
  const isCustomSeqEnabled = getCustomSeqStatus?.data?.shouldUseCustomSequence
  const isCustomSeqNull = getCustomSeqStatus?.data?.nullCustomSequence
  const [customSeqLoading, setCustomSeqLoading] = React.useState<boolean>(false)

  //Env Card
  const {
    data: envData,
    loading: envLoading,
    error: envError,
    refetch: envRefetch
  } = useMutateAsGet(useGetEnvironmentInstanceDetails, {
    queryParams,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })
  const resData = defaultTo(envData?.data?.environmentGroupInstanceDetails, [] as EnvironmentGroupInstanceDetail[])

  //Artifact Card
  const {
    data: artifactData,
    loading: artifactLoading,
    error: artifactError,
    refetch: artifactRefetch
  } = useGetArtifactInstanceDetails({
    queryParams
  })
  const artifactCardData = defaultTo(artifactData?.data?.artifactInstanceDetails, [] as ArtifactInstanceDetail[])

  // Chart Version Card
  const {
    data: chartVersionInstanceDetailsData,
    loading: chartVersionInstanceDetailsLoading,
    error: chartVersionInstanceDetailsFetchError,
    refetch: refetchChartVersionInstanceDetails
  } = useGetChartVersionInstanceDetails({
    queryParams
  })
  const chartVersionInstanceDetailsCardData = defaultTo(
    chartVersionInstanceDetailsData?.data?.chartVersionInstanceDetails,
    [] as ChartVersionInstanceDetail[]
  )

  const envList: EnvCardProps[] = resData.map(item => {
    return {
      id: item.id,
      name: item.name,
      environmentTypes: item.environmentTypes,
      count: item.count,
      artifactDeploymentDetails: item.artifactDeploymentDetails,
      isDrift: item.isDrift,
      isEnvGroup: item.isEnvGroup,
      isRevert: item.isRevert,
      isRollback: item.isRollback
    }
  })

  const artifactList: ArtifactInstanceDetail[] = artifactCardData.map(item => {
    return {
      artifact: item.artifact,
      environmentGroupInstanceDetails: item.environmentGroupInstanceDetails
    }
  })

  const chartVersionInstanceDetailsList: ChartVersionInstanceDetail[] = chartVersionInstanceDetailsCardData.map(
    item => {
      return {
        chartVersion: item.chartVersion,
        environmentGroupInstanceDetails: item.environmentGroupInstanceDetails
      }
    }
  )

  const [data, loading, error, refetch, visibleCardCount, cardInfoList] =
    cardView === CardView.ENV
      ? [resData, envLoading, envError, envRefetch, 5, envList]
      : cardView === CardView.ARTIFACT
      ? [artifactCardData, artifactLoading, artifactError, artifactRefetch, 3, artifactList]
      : [
          chartVersionInstanceDetailsCardData,
          chartVersionInstanceDetailsLoading,
          chartVersionInstanceDetailsFetchError,
          refetchChartVersionInstanceDetails,
          3,
          chartVersionInstanceDetailsList
        ]

  const renderCards = createGroups(cardInfoList, visibleCardCount)

  const slide = [0, 1, 2]
  const envSlide = [0, 1, 2, 3, 4]

  const dropdownOptions = React.useMemo(() => {
    return [
      {
        label: getString('cd.serviceDashboard.bothTypeLabel'),
        value: CardSortOption.ALL
      },
      {
        label: getString('cd.serviceDashboard.prod'),
        value: CardSortOption.PROD
      },
      {
        label: getString('cd.preProductionType'),
        value: CardSortOption.PRE_PROD
      }
    ]
  }, [])

  // istanbul ignore next
  const onDropdownChange = React.useCallback((item: SelectOption) => {
    const sortFilter = []
    if (item.value === CardSortOption.ALL) {
      setSortOptions(CardSortOption.ALL)
      sortFilter.push('Production')
      sortFilter.push('PreProduction')
    } else if (item.value === CardSortOption.PROD) {
      setSortOptions(CardSortOption.PROD)
      sortFilter.push('Production')
    } else if (item.value === CardSortOption.PRE_PROD) {
      setSortOptions(CardSortOption.PRE_PROD)
      sortFilter.push('PreProduction')
    }

    envRefetch({
      queryParams,
      body: {
        filterType: EntityType.Environment,
        environmentTypes: sortFilter
      }
    })
    setEnvId(undefined)
    setSelectedEnv(undefined)
  }, [])

  const afterSaveActions = (): void => {
    envRefetch()
    refetchCustomSeqStatus()
    setSortOptions(CardSortOption.ALL)
  }

  const handleCustomSeqSwitchChange = async (event: React.FormEvent<HTMLInputElement>): Promise<void> => {
    clear()
    try {
      const response = await setCustomSequenceStatusPromise({
        queryParams: {
          ...queryParams,
          useCustomSequence: event.currentTarget.checked && !isCustomSeqEnabled
        },
        body: undefined
      })

      if (response.status === 'SUCCESS') {
        showSuccess(
          getString('cd.customSequence.switchSuccessMsg', {
            sequence: response.data?.shouldUseCustomSequence ? 'custom' : 'default'
          })
        )
        refetchCustomSeqStatus()
        envRefetch({
          queryParams,
          body: {
            filterType: EntityType.Environment,
            environmentTypes: sortFilterParam(sortOptions)
          }
        })
      } else {
        showError(getString('cd.customSequence.switchFailedMsg'))
      }
    } catch (err) {
      // istanbul ignore next
      showError(getErrorInfoFromErrorObject(err))
    } finally {
      setCustomSeqLoading(false)
    }
  }

  const getCardSlides = (): JSX.Element[] => {
    if (cardView === CardView.ENV) {
      return renderCards.map((item, idx) => {
        const envInfo = item as EnvCardProps[]
        return (
          <Layout.Horizontal key={idx} className={css.envCardGrid}>
            {envSlide.map(i => {
              if (!envInfo[i]) return null
              return (
                <EnvCard
                  key={i}
                  setSelectedEnv={setSelectedEnv}
                  setEnvId={setEnvId}
                  setIsDetailsDialogOpen={setIsDetailsDialogOpen}
                  setEnvFilter={setEnvFilter}
                  env={envInfo[i]}
                  selectedEnv={selectedEnv}
                />
              )
            })}
          </Layout.Horizontal>
        )
      })
    }

    if (cardView === CardView.ARTIFACT) {
      return renderCards.map((item, idx) => {
        const artifactInfo = item as ArtifactInstanceDetail[]
        return (
          <Layout.Horizontal key={idx} className={css.artifactCardGrid}>
            {slide.map(i => {
              if (!artifactInfo[i]) return null

              return (
                <ArtifactCard
                  key={i}
                  setArtifactName={setArtifactName}
                  setSelectedArtifact={setSelectedArtifact}
                  setIsDetailsDialogOpen={setIsDetailsDialogOpen}
                  setEnvFilter={setEnvFilter}
                  setArtifactFilter={setArtifactFilter}
                  artifact={artifactInfo[i]}
                  selectedArtifact={selectedArtifact}
                  setArtifactFilterApplied={setArtifactFilterApplied}
                />
              )
            })}
          </Layout.Horizontal>
        )
      })
    }

    if (cardView === CardView.CHART_VERSIONS) {
      return renderCards.map((item, idx) => {
        const chartVersionInstanceDetailList = item as ChartVersionInstanceDetail[]
        return (
          <Layout.Horizontal key={idx} className={css.artifactCardGrid}>
            {slide.map(i => {
              if (!chartVersionInstanceDetailList[i]) return null

              return (
                <ChartVersionCard
                  key={i}
                  setChartVersionName={setChartVersionName}
                  setSelectedChartVersion={setSelectedChartVersion}
                  setIsDetailsDialogOpen={setIsDetailsDialogOpen}
                  setEnvFilter={setEnvFilter}
                  setChartVersionFilter={setChartVersionFilter}
                  chartVersion={chartVersionInstanceDetailList[i]}
                  selectedChartVersion={selectedChartVersion}
                  setChartVersionFilterApplied={setChartVersionFilterApplied}
                />
              )
            })}
          </Layout.Horizontal>
        )
      })
    }

    return []
  }

  const cardList: CardInterface[] = [
    {
      type: CardView.ENV,
      title: getString('environments'),
      info: '',
      icon: 'environments',
      size: 16
    },
    {
      type: CardView.ARTIFACT,
      title: getString('artifacts'),
      info: '',
      icon: 'environments',
      size: 16
    }
  ]

  if (shouldShowChartVersion(selectedDeploymentType)) {
    cardList.push({
      type: CardView.CHART_VERSIONS,
      title: getString('common.chartVersions'),
      info: '',
      icon: 'chart',
      size: 16
    })
  }
  return (
    <Container>
      <Text color={Color.GREY_800} font={{ variation: FontVariation.H6 }} className={css.titleText}>
        {cardView === CardView.ENV ? getString('cd.serviceDashboard.envAndGroup') : getString('artifacts')}
      </Text>
      <div className={css.titleStyle}>
        <DropDown
          items={dropdownOptions}
          onChange={onDropdownChange}
          value={sortOptions}
          filterable={false}
          usePortal
          disabled={cardView === CardView.ARTIFACT}
        />
        <div className={css.envCardViewHeaderLhs}>
          <Button
            variation={ButtonVariation.LINK}
            style={{ paddingRight: 12, fontSize: 13 }}
            icon="panel-table"
            iconProps={{ size: 13 }}
            text={getString('cd.environmentDetailPage.viewInTable')}
            onClick={() => {
              setEnvFilter({ envId: undefined, isEnvGroup: false })
              setArtifactFilter(undefined)
              setChartVersionFilter(undefined)
              setIsDetailsDialogOpen(true)
              setArtifactFilterApplied(false)
              setChartVersionFilterApplied(false)
            }}
            disabled={!data || data.length === 0}
          />
          {cardView === CardView.ENV ? (
            <Layout.Horizontal flex={{ alignItems: 'center' }} className={css.customSeq}>
              <Switch
                disabled={getCustomSeqLoading || customSeqLoading || isCustomSeqNull || !data || data.length === 0}
                onChange={event => {
                  setCustomSeqLoading(true)
                  handleCustomSeqSwitchChange(event)
                }}
                className={css.switch}
                checked={isCustomSeqEnabled}
              />
              <Text
                rightIconProps={{
                  className: css.customSeqIcon,
                  color: Color.PRIMARY_7,
                  onClick: () => setCustomSeqDrawerOpen(true),
                  size: 18
                }}
                rightIcon="code-settings"
                font={{ variation: FontVariation.SMALL }}
                color={Color.GREY_700}
              >
                {getString('cd.customSequence.customSequence')}
              </Text>
              {isCustomSeqDrawerOpen ? (
                <CustomSequenceDrawer
                  drawerOpen={isCustomSeqDrawerOpen}
                  setDrawerOpen={setCustomSeqDrawerOpen}
                  afterSaveActions={afterSaveActions}
                />
              ) : null}
            </Layout.Horizontal>
          ) : null}
          <ServiceDetailsDialog
            isOpen={isDetailsDialogOpen}
            setIsOpen={setIsDetailsDialogOpen}
            envFilter={envFilter}
            artifactFilter={artifactFilter}
            chartVersionFilter={chartVersionFilter}
            isEnvView={cardView === CardView.ENV}
            isArtifactView={cardView === CardView.ARTIFACT}
            artifactFilterApplied={artifactFilterApplied}
            chartVersionFilterApplied={chartVersionFilterApplied}
          />

          <CardSelect
            data={cardList}
            className={css.pillToggle}
            renderItem={(item: CardInterface) => <>{item.title}</>}
            selected={cardList.find(card => card.type === cardView)}
            onChange={(val: CardInterface) => {
              setEnvId(undefined)
              setArtifactName(undefined)
              setChartVersionName(undefined)
              setSelectedEnv(undefined)
              setSelectedArtifact(undefined)
              setSelectedChartVersion(undefined)
              setArtifactFilterApplied(false)
              setCardView(val.type as CardView)
            }}
          />
        </div>
      </div>
      {loading ? (
        <Container
          flex={{ justifyContent: 'center', alignItems: 'center' }}
          height={250}
          data-test="ServiceDetailsEnvCardLoading"
        >
          <Icon name="spinner" color={Color.BLUE_500} size={30} />
        </Container>
      ) : error ? (
        <Container data-test="ServiceDetailsEnvCardError" height={250} flex={{ justifyContent: 'center' }}>
          <PageError onClick={() => refetch?.()} message={getErrorInfoFromErrorObject(error)} />
        </Container>
      ) : !data || data.length === 0 ? (
        <EnvCardViewEmptyState message={getString('pipeline.ServiceDetail.envCardEmptyStateMsg')} />
      ) : (
        <Carousel
          key={cardView}
          previousElement={
            activeSlide > 1 ? (
              <Button
                intent="primary"
                className={css.prevButton}
                icon="double-chevron-left"
                minimal
                iconProps={{
                  size: 22,
                  color: Color.PRIMARY_7
                }}
              />
            ) : (
              <span />
            )
          }
          nextElement={
            activeSlide < Math.ceil(defaultTo(data, []).length / visibleCardCount) ? (
              <Button
                intent="primary"
                className={css.nextButton}
                icon="double-chevron-right"
                minimal
                iconProps={{
                  size: 22,
                  color: Color.PRIMARY_7
                }}
              />
            ) : (
              <span />
            )
          }
          hideIndicators={true}
          onChange={setActiveSlide}
          slideClassName={cx(css.slideStyle, { [css.paddingLeft12]: activeSlide === 1 })}
        >
          {getCardSlides()}
        </Carousel>
      )}
    </Container>
  )
}

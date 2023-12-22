/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { defaultTo, times } from 'lodash-es'
import { Button, Container, Heading, Layout, StepProps, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { StringKeys, useStrings } from 'framework/strings'
import { useFeatureFlag } from '@modules/10-common/hooks/useFeatureFlag'
import { FeatureFlag } from '@modules/10-common/featureFlags'
import { useSelectCards, CardData } from '@platform/connectors/common/RequirementCard/RequirementCard'
import EmptyState from '@connectors/components/CreateConnector/CENGAwsConnector/images/empty-state.svg'
import type { GcpCloudCostConnector } from 'services/ce'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions, ConnectorTypes } from '@common/constants/TrackingConstants'
import type { CEGcpConnectorDTO } from './OverviewStep'
import { FeatureCard, FeatureDetails, Features } from '../../CENGAwsConnector/steps/CrossAccountRoleStep1'
import css from '../CreateCeGcpConnector.module.scss'

const ChooseRequirements: React.FC<StepProps<CEGcpConnectorDTO>> = ({ prevStepData, nextStep, previousStep }) => {
  const { getString } = useStrings()
  const featuresEnabled = (prevStepData?.spec?.featuresEnabled || []) as Features[]
  const isGovernanceEnabled = useFeatureFlag(FeatureFlag.CCM_ENABLE_GCP_CLOUD_ASSET_GOVERNANCE_UI)

  const featureCards = useMemo(() => {
    const cardsArr = [
      {
        icon: 'ce-visibility',
        text: getString('platform.connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
        value: Features.BILLING,
        heading: getString('platform.connectors.costVisibility'),
        desc: (
          <Text font={{ variation: FontVariation.SMALL_BOLD }}>{getString('platform.connectors.costVisibility')}</Text>
        ),
        prefix: getString('platform.connectors.ceGcp.gcp').toUpperCase(),
        features: times(5, i =>
          getString(`platform.connectors.ceGcp.chooseRequirements.cardDetails.billing.feat${i + 1}` as StringKeys)
        ),
        footer: getString('platform.connectors.ceGcp.chooseRequirements.cardDetails.billing.footer')
      },
      {
        icon: 'ce-visibility',
        text: getString('platform.connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
        value: Features.VISIBILITY,
        heading: getString('platform.connectors.ceAws.crossAccountRoleStep1.visible.heading'),
        desc: (
          <>
            {getString('common.resourceLabel')}{' '}
            <Text inline font={{ variation: FontVariation.SMALL_BOLD }}>
              {getString('platform.connectors.ceAzure.chooseRequirements.visibility.heading')}
            </Text>
          </>
        ),
        prefix: getString('platform.connectors.ceGcp.gcp').toUpperCase(),
        features: times(2, i =>
          getString(`platform.connectors.ceGcp.chooseRequirements.cardDetails.visibility.feat${i + 1}` as StringKeys)
        ),
        footer: (
          <>
            {getString('platform.connectors.ceAzure.chooseRequirements.optimization.footer1')}{' '}
            <a
              href="https://docs.harness.io/article/kxnsritjls-set-up-cost-visibility-for-gcp"
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
            >
              {getString('permissions').toLowerCase()}
            </a>{' '}
            {getString('platform.connectors.ceGcp.chooseRequirements.cardDetails.optimization.footer')}
          </>
        )
      },
      {
        icon: 'nav-settings',
        text: getString('platform.connectors.ceAzure.chooseRequirements.optimizationCardDesc'),
        value: Features.OPTIMIZATION,
        heading: getString('common.ce.autostopping'),
        desc: (
          <>
            {getString('platform.connectors.ceAws.crossAccountRoleStep1.cards.autoStopping.prefix')}{' '}
            <Text inline font={{ variation: FontVariation.SMALL_BOLD }}>
              {getString('common.ce.autostopping')}
            </Text>
          </>
        ),
        prefix: getString('platform.connectors.ceGcp.chooseRequirements.cardDetails.optimization.prefix').toUpperCase(),
        features: times(4, i =>
          getString(`platform.connectors.ceGcp.chooseRequirements.cardDetails.optimization.feat${i + 1}` as StringKeys)
        ),
        footer: (
          <>
            {getString('platform.connectors.ceAzure.chooseRequirements.optimization.footer1')}{' '}
            <a
              href="https://docs.harness.io/article/kxnsritjls-set-up-cost-visibility-for-gcp"
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
            >
              {getString('permissions').toLowerCase()}
            </a>{' '}
            {getString('platform.connectors.ceGcp.chooseRequirements.cardDetails.optimization.footer')}
          </>
        )
      }
    ]

    if (isGovernanceEnabled) {
      cardsArr.push({
        icon: 'nav-settings',
        text: getString('platform.connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
        value: Features.GOVERNANCE,
        heading: getString('platform.connectors.ceAws.crossAccountRoleStep1.cards.governance.header'),
        desc: (
          <Text inline font={{ variation: FontVariation.SMALL_BOLD }}>
            {getString('platform.connectors.ceAws.crossAccountRoleStep1.cards.governance.header')}
          </Text>
        ),
        prefix: getString('platform.connectors.ceGcp.gcp').toUpperCase(),
        features: [
          getString('platform.connectors.ceGcp.chooseRequirements.cardDetails.assetManagement.feat1'),
          getString('platform.connectors.ceAws.crossAccountRoleStep1.cards.governance.feat2')
        ],
        footer: (
          <>
            {getString('platform.connectors.ceAzure.chooseRequirements.optimization.footer1')}{' '}
            <a
              href="https://docs.harness.io/article/kxnsritjls-set-up-cost-visibility-for-gcp"
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
            >
              {getString('permissions').toLowerCase()}
            </a>{' '}
            {getString('platform.connectors.ceGcp.chooseRequirements.cardDetails.optimization.footer')}
          </>
        )
      })
    }

    return cardsArr as CardData[]
  }, [isGovernanceEnabled])

  const { selectedCards, setSelectedCards } = useSelectCards({ featuresEnabled, featureCards })

  const [featureDetails, setFeatureDetails] = useState<CardData>()

  const handleSubmit = () => {
    trackEvent(ConnectorActions.ChooseRequirementsSubmit, {
      category: Category.CONNECTOR,
      connector_type: ConnectorTypes.CEGcp
    })
    let features: Features[] = selectedCards.map(card => card.value)
    if (!prevStepData?.includeBilling) {
      features = features.filter(item => item !== 'BILLING')
    }
    const newspec: GcpCloudCostConnector = {
      projectId: '',
      ...prevStepData?.spec,
      featuresEnabled: features,
      serviceAccountEmail: defaultTo(prevStepData?.serviceAccount, '')
    }
    const payload = prevStepData
    if (payload) {
      payload.spec = newspec
    }
    nextStep?.(payload)
  }

  const handleprev = () => {
    previousStep?.({ ...(prevStepData as CEGcpConnectorDTO) })
  }

  const handleCardSelection = (item: CardData) => {
    if (item.value !== Features.BILLING) {
      const sc = [...selectedCards]
      const index = sc.indexOf(item)
      if (index > -1) {
        sc.splice(index, 1)
      } else {
        sc.push(item)
      }

      setSelectedCards(sc)
    }
  }

  const { trackEvent } = useTelemetry()

  useTrackEvent(ConnectorActions.ChooseRequirementsLoad, {
    category: Category.CONNECTOR,
    connector_type: ConnectorTypes.CEGcp
  })

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        {getString('platform.connectors.ceGcp.chooseRequirements.heading')}
        <span>{getString('platform.connectors.ceGcp.chooseRequirements.choosePermissions')}</span>
      </Heading>
      <Text color="grey800">{getString('platform.connectors.ceGcp.chooseRequirements.description')}</Text>
      <Layout.Vertical spacing={'medium'}>
        <Text font={{ italic: true }}>{getString('platform.connectors.ceGcp.chooseRequirements.info')}</Text>
        <div>
          <Layout.Horizontal margin={{ top: 'large' }}>
            <Container padding={{ top: 'small' }}>
              {featureCards.map(card => (
                <FeatureCard
                  key={card.value}
                  feature={card}
                  handleCardSelection={() => handleCardSelection(card)}
                  isDefault={Features.BILLING === card.value}
                  isSelected={selectedCards.some(selectedCard => selectedCard.value === card.value)}
                  setFeatureDetails={() => setFeatureDetails(card)}
                />
              ))}
            </Container>
            <Layout.Vertical spacing="xlarge" className={css.featureDetailsCtn}>
              {featureDetails ? (
                <FeatureDetails feature={featureDetails} />
              ) : (
                <Layout.Vertical spacing="medium" className={css.emptyState}>
                  <img src={EmptyState} width={110} />
                  <Text font={{ variation: FontVariation.TINY, align: 'center' }} width={100} color={Color.GREY_600}>
                    {getString('platform.connectors.ceAws.crossAccountRoleStep1.hoverOver')}
                  </Text>
                </Layout.Vertical>
              )}
            </Layout.Vertical>
          </Layout.Horizontal>
          <Layout.Horizontal className={css.buttonPanel} spacing="small">
            <Button text={getString('previous')} icon="chevron-left" onClick={handleprev}></Button>
            <Button
              type="submit"
              intent="primary"
              text={getString('continue')}
              rightIcon="chevron-right"
              onClick={handleSubmit}
              disabled={!prevStepData?.includeBilling && selectedCards.length === 0}
            />
          </Layout.Horizontal>
        </div>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default ChooseRequirements

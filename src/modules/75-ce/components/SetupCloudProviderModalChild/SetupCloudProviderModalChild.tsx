import React, { useState } from 'react'
import cx from 'classnames'
import { Button, Card, Heading, Color, Layout, Icon, IconName, Text } from '@wings-software/uicore'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import type { Project } from 'services/cd-ng'
import type { ConnectorInfoDTO } from 'services/cd-ng'

import css from './SetupCloudProviderModalChild.module.scss'

interface SetupCloudProviderModalChild {
  closeModal?: () => void
  routeToCE: (provider: ConnectorInfoDTO['type'], project?: Project) => void
}

const SetupCloudProviderModalChild: React.FC<SetupCloudProviderModalChild> = props => {
  const { closeModal, routeToCE } = props

  const { getString } = useStrings()
  const { selectedProject } = useAppStore()
  const [selectedProvider, setSelectedProvider] = useState<ConnectorInfoDTO['type'] | undefined>(undefined)

  const isContinueDisabled = !selectedProvider

  const isAzureSelected = selectedProvider === 'CEAzure'
  const isAwsSelected = selectedProvider === 'CEAws'

  function handleSelectAzure(): void {
    setSelectedProvider('CEAzure')
  }

  function handleSelectAws(): void {
    setSelectedProvider('CEAws')
  }

  function handleSetupLater(): void {
    closeModal?.()
  }

  function handleContinueClick(): void {
    if (selectedProvider) {
      routeToCE(selectedProvider, selectedProject)
    }
  }

  return (
    <Layout.Vertical spacing="small">
      <Heading color={Color.BLACK} font={{ size: 'large', weight: 'bold' }} padding={{ top: 'xlarge' }}>
        {getString('ce.co.setupCloudProvider')}
      </Heading>
      <Text font={{ size: 'medium' }}>{getString('ce.co.getStarted')}</Text>
      <Layout.Horizontal spacing="medium" style={{ paddingTop: '30px' }}>
        <div className={cx(css.cardContainer)}>
          <Card interactive={true} selected={isAzureSelected} className={cx(css.card)} onClick={handleSelectAzure}>
            <Icon name={`service-azure` as IconName} size={24} />
          </Card>
          <Text font={{ size: 'xsmall', weight: 'bold' }} style={{ marginTop: 8 }}>
            {getString('common.samlProvider.azure')}
          </Text>
        </div>
        <div className={cx(css.cardContainer)}>
          <Card interactive={true} selected={isAwsSelected} className={cx(css.card)} onClick={handleSelectAws}>
            <Icon name={`service-aws` as IconName} size={24} />
          </Card>
          <Text font={{ size: 'xsmall', weight: 'bold' }} style={{ marginTop: 8 }}>
            {getString('ce.co.cloudProviders.aws')}
          </Text>
        </div>
      </Layout.Horizontal>
      <Layout.Horizontal spacing="medium" style={{ paddingTop: '30px' }}>
        <Button
          intent="primary"
          disabled={isContinueDisabled}
          text={getString('continue')}
          onClick={handleContinueClick}
        />
        <Button intent="none" text={getString('pipeline.createPipeline.setupLater')} onClick={handleSetupLater} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default SetupCloudProviderModalChild

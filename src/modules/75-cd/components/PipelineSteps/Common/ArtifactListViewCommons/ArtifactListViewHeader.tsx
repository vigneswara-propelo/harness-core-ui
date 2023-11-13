import React from 'react'

import { Container, HarnessDocTooltip } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { getArtifactsHeaderTooltipId } from '@modules/70-pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { ServiceDefinition } from 'services/cd-ng'
import { PrimaryArtifactSelectionDropDown } from './PrimaryArtifactSelectionDropDown/PrimaryArtifactSelectionDropDown'

export interface ArtifactListViewHeaderProps {
  selectedDeploymentType: ServiceDefinition['type']
  isPropagating?: boolean
  isPrimaryArtifactSources: boolean
}

export const ArtifactListViewHeader = (props: ArtifactListViewHeaderProps): JSX.Element => {
  const { selectedDeploymentType, isPrimaryArtifactSources, isPropagating = false } = props
  const { getString } = useStrings()
  return (
    <Container
      className={'ng-tooltip-native'}
      font={{ variation: FontVariation.CARD_TITLE }}
      padding={{ bottom: 'medium' }}
      flex={{ justifyContent: 'space-between' }}
      margin={{ bottom: 'xsmall' }}
    >
      <div data-tooltip-id={getArtifactsHeaderTooltipId(selectedDeploymentType)}>
        {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
        <HarnessDocTooltip tooltipId={getArtifactsHeaderTooltipId(selectedDeploymentType)} useStandAlone={true} />
      </div>
      {isPrimaryArtifactSources && <PrimaryArtifactSelectionDropDown isPropagating={isPropagating} />}
    </Container>
  )
}

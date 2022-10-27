import React from 'react'
import { Container, FontVariation, GroupedThumbnailSelect, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { getDataGroupSelectorItems } from './DataSourceTypeSelectorUtils'
import { DataSourceTypeFieldNames } from '../../DefineHealthSource.constant'

export default function PrometheusDataSourceTypeSelector(): JSX.Element {
  const { getString } = useStrings()

  return (
    <Container margin={{ bottom: 'large' }} data-testid="dataSourceTypeSelector">
      <Text margin={{ top: 'small' }} font={{ variation: FontVariation.SMALL_BOLD }}>
        {getString('common.git.connectionType')}
      </Text>
      <Text margin={{ top: 'xsmall', bottom: 'medium' }} font={{ variation: FontVariation.SMALL }}>
        {getString('cv.healthSource.selectConnectionTypeInfo')}
      </Text>
      <GroupedThumbnailSelect
        name={DataSourceTypeFieldNames.DataSourceType}
        groups={getDataGroupSelectorItems(getString)}
      />
    </Container>
  )
}

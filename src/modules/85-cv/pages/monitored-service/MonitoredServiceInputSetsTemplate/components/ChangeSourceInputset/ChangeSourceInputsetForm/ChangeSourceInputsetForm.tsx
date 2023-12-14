/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Card, Text, FormInput, MultiTypeInputType } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { ChangeSourceDTO, ConnectorInfoDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import { FormConnectorReferenceField } from '@platform/connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import { spacingMedium } from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.constants'
import { ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { changeSourceTypeMapping } from '../../../MonitoredServiceInputSetsTemplate.utils'
import css from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.module.scss'

interface ChangeSourceInputsetFormProps {
  changeSources?: ChangeSourceDTO[]
  isReadOnlyInputSet?: boolean
  isReconcile?: boolean
}
export const ChangeSourceInputsetForm = ({
  isReconcile,
  changeSources,
  isReadOnlyInputSet
}: ChangeSourceInputsetFormProps): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  return changeSources?.length ? (
    <Container>
      {changeSources?.map((changeSource, index) => {
        const spec = changeSource?.spec || []
        const path = `sources.changeSources.${index}.spec`

        const runtimeInputs = isReconcile
          ? Object.entries(spec).map(item => {
              return { name: item[0], path: `${path}.${item[0]}` }
            })
          : Object.entries(spec)
              .filter(item => item[1] === '<+input>')
              .map(item => {
                return { name: item[0], path: `${path}.${item[0]}` }
              })

        const sourceType = changeSourceTypeMapping(changeSource.type || '')

        return (
          <Card key={`${changeSource?.name}.${index}`} className={css.healthSourceInputSet}>
            <Text font={'normal'} color={Color.BLACK} style={{ paddingBottom: spacingMedium }}>
              {getString('changeSource')}: {changeSource?.name}
            </Text>
            {runtimeInputs.reverse()?.map(input => {
              if (input.name === 'connectorRef' && !isReadOnlyInputSet) {
                return (
                  <FormConnectorReferenceField
                    width={400}
                    type={sourceType as ConnectorInfoDTO['type']}
                    name={input.path}
                    label={
                      <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
                        {getString('platform.connectors.selectConnector')}
                      </Text>
                    }
                    accountIdentifier={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    placeholder={getString('cv.healthSource.connectors.selectConnector', {
                      sourceType
                    })}
                    tooltipProps={{ dataTooltipId: 'selectHealthSourceConnector' }}
                  />
                )
              } else {
                return (
                  <FormInput.MultiTextInput
                    key={input.name}
                    name={input.path}
                    label={input.name}
                    multiTextInputProps={{ allowableTypes: [MultiTypeInputType.FIXED] }}
                  />
                )
              }
            })}
          </Card>
        )
      })}
    </Container>
  ) : (
    <></>
  )
}

/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isUndefined } from 'lodash-es'
import { Card, SelectOption, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import OrgAccountLevelServiceEnvField from '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/component/OrgAccountLevelServiceEnvField/OrgAccountLevelServiceEnvField'
import { spacingMedium } from '../../MonitoredServiceInputSetsTemplate.constants'
import css from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.module.scss'

interface ServiceEnvironmentInputSetInterface {
  serviceValue?: string
  environmentValue?: string | SelectOption
  onChange: any
  isReadOnlyInputSet: boolean
  serviceKey?: string
  environmentKey?: string
}
export default function ServiceEnvironmentInputSet({
  serviceValue,
  environmentValue,
  isReadOnlyInputSet,
  onChange,
  serviceKey = 'serviceRef',
  environmentKey = 'environmentRef'
}: ServiceEnvironmentInputSetInterface): JSX.Element {
  const { getString } = useStrings()

  if (isUndefined(serviceValue) && isUndefined(environmentValue)) {
    return <></>
  }

  return (
    <Card className={css.cardStyle}>
      <Text font={{ variation: FontVariation.CARD_TITLE }} color={Color.BLACK} style={{ paddingBottom: spacingMedium }}>
        {getString('cv.monitoredServices.serviceAndEnvironment')}
      </Text>
      <OrgAccountLevelServiceEnvField
        isInputSet
        isTemplate={isReadOnlyInputSet}
        serviceOnSelect={(selectedService: SelectOption) => onChange(serviceKey, selectedService.value)}
        environmentOnSelect={(selectedEnv: SelectOption) => onChange(environmentKey, selectedEnv.value)}
      />
    </Card>
  )
}

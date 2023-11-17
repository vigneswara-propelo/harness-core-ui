/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  Container,
  ExpressionAndRuntimeType,
  FormInput,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  Text,
  getMultiTypeFromValue
} from '@harness/uicore'
import { noop } from 'lodash-es'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { InputWithDynamicModalForJson } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJson'

import { InputWithDynamicModalForJsonProps } from '@modules/85-cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJson.types'
import { isMultiTypeRuntime } from '@modules/10-common/utils/utils'
import { MapSplunkToServiceFieldNames } from '../../constants'
import type { MapSplunkQueriesToServiceProps } from './types'
import { MapSplunkQueryToService } from '../../types'
import css from './SplunkMetricNameAndHostIdentifier.module.scss'

export function SplunkMetricNameAndHostIdentifier(props: MapSplunkQueriesToServiceProps): JSX.Element {
  const {
    onChange,
    sampleRecord,
    isQueryExecuted,
    loading,
    serviceInstance,
    isConnectorRuntimeOrExpression,
    isTemplate,
    expressions
  } = props
  const { getString } = useStrings()
  const isAddingIdentifiersDisabled = !isQueryExecuted || loading

  const { setFieldValue, setValues } = useFormikContext<MapSplunkQueryToService>()

  const isInitalRender = useRef(true)

  const [multiType, setMultiType] = useState<MultiTypeInputType>(getMultiTypeFromValue(serviceInstance))

  useEffect(() => {
    if (!isInitalRender.current && isTemplate) {
      setValues(currentValues => {
        return {
          ...currentValues,
          [MapSplunkToServiceFieldNames.SERVICE_INSTANCE]: isMultiTypeRuntime(multiType)
            ? RUNTIME_INPUT_VALUE
            : undefined
        }
      })
    }
    isInitalRender.current = false
  }, [multiType])

  return (
    <Container className={css.main}>
      <FormInput.Text
        label={getString('cv.monitoringSources.queryNameLabel')}
        name={MapSplunkToServiceFieldNames.METRIC_NAME}
      />
      {isTemplate ? (
        <Container className={css.multiTypeButtonContainer}>
          <Text margin={{ bottom: 'small' }} style={{ fontSize: 13, fontWeight: 'normal' }}>
            {getString('cv.monitoringSources.gcoLogs.serviceInstance')}
          </Text>
          <ExpressionAndRuntimeType<InputWithDynamicModalForJsonProps>
            name={MapSplunkToServiceFieldNames.SERVICE_INSTANCE}
            value={serviceInstance}
            key={`${multiType}`}
            btnClassName={css.multiTypeButton}
            allowableTypes={
              isConnectorRuntimeOrExpression
                ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
            }
            expressions={expressions}
            multitypeInputValue={multiType}
            onTypeChange={type => {
              setMultiType(type)
            }}
            onChange={(val1, val2, currentMultiType) => {
              if (currentMultiType === MultiTypeInputType.FIXED && val1) {
                /**
                 * val1 => property name
                 * val2 => updated value
                 */
                setFieldValue(MapSplunkToServiceFieldNames.SERVICE_INSTANCE as string, val2)
              } else if (currentMultiType !== MultiTypeInputType.FIXED) {
                /**
                 * For other multi types other than fixed,
                 * updated value is passed via val1
                 *
                 * val1 => updated value
                 */
                setFieldValue(MapSplunkToServiceFieldNames.SERVICE_INSTANCE, val1)
              }
            }}
            fixedTypeComponentProps={{
              onChange: noop,
              fieldValue: serviceInstance,
              isQueryExecuted,
              isDisabled: isAddingIdentifiersDisabled,
              sampleRecord,
              inputName: MapSplunkToServiceFieldNames.SERVICE_INSTANCE,
              noRecordModalHeader: getString('cv.monitoringSources.gcoLogs.newGCOLogsServiceInstance'),
              noRecordInputLabel: getString('cv.monitoringSources.gcoLogs.gcoLogsServiceInstance'),
              recordsModalHeader: getString('cv.monitoringSources.gcoLogs.selectPathForServiceInstance')
            }}
            fixedTypeComponent={InputWithDynamicModalForJson}
          />
        </Container>
      ) : (
        <InputWithDynamicModalForJson
          onChange={onChange}
          fieldValue={serviceInstance}
          isQueryExecuted={isQueryExecuted}
          isDisabled={isAddingIdentifiersDisabled}
          sampleRecord={sampleRecord}
          inputName={MapSplunkToServiceFieldNames.SERVICE_INSTANCE}
          inputLabel={getString('cv.monitoringSources.gcoLogs.serviceInstance')}
          noRecordModalHeader={getString('cv.monitoringSources.gcoLogs.newGCOLogsServiceInstance')}
          noRecordInputLabel={getString('cv.monitoringSources.gcoLogs.gcoLogsServiceInstance')}
          recordsModalHeader={getString('cv.monitoringSources.gcoLogs.selectPathForServiceInstance')}
        />
      )}
    </Container>
  )
}

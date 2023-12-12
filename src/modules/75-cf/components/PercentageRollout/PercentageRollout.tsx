/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useMemo } from 'react'
import { Container, FormInput, Layout, SelectOption, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { Segment, Variation } from 'services/cf'
import { CFVariationColorsColorRef } from '@cf/constants'
import DistributionBar, { DistributionSegment } from './DistributionBar'

import css from './PercentageRollout.module.scss'

export interface PercentageRolloutProps {
  prefix: (fieldName: string) => string
  variations: Variation[]
  fieldValues?: {
    variations: { variation: string; weight: string | number }[]
  }
  targetGroupValue?: SelectOption
  targetGroups?: Segment[]
  addClearButton?: boolean
  distributionWidth?: string | number
  disabled?: boolean
  hideBucketBy?: boolean
  bucketByAttributes?: SelectOption[]
  [propName: string]: unknown
}

const PercentageRollout: FC<PercentageRolloutProps> = ({
  prefix,
  variations,
  fieldValues,
  targetGroups,
  targetGroupValue,
  distributionWidth = '100%',
  addClearButton = false,
  disabled = false,
  hideBucketBy = false,
  bucketByAttributes,
  ...restProps
}) => {
  const { getString } = useStrings()

  const targetGroupItems = useMemo<SelectOption[]>(
    () => (targetGroups || []).map(({ name, identifier }) => ({ label: name, value: identifier })),
    [targetGroups]
  )

  const distributionSegments = useMemo<DistributionSegment[]>(
    () =>
      variations.map((variation, index) => {
        const weight = fieldValues?.variations?.[index]?.weight || 0

        return {
          variation,
          weight: typeof weight === 'number' ? weight : parseInt(weight)
        }
      }),
    [variations, fieldValues?.variations]
  )

  const total = useMemo<number>(
    () => distributionSegments.reduce<number>((totalWeight, { weight }) => totalWeight + weight, 0),
    [distributionSegments]
  )

  const bucketByItems = useMemo<SelectOption[]>(
    () => [
      { label: getString('cf.percentageRollout.bucketBy.identifierDefault'), value: 'identifier' },
      { label: getString('cf.percentageRollout.bucketBy.name'), value: 'name' },
      ...(bucketByAttributes || [])
    ],
    [bucketByAttributes, getString]
  )

  return (
    <Layout.Vertical spacing="large" {...restProps}>
      {(targetGroups || !hideBucketBy) && (
        <Layout.Horizontal spacing="medium">
          {targetGroups && (
            <FormInput.Select
              value={targetGroupValue}
              className={css.targetGroupAndBucketBy}
              name={prefix('clauses[0].values[0]')}
              items={targetGroupItems}
              label={getString('cf.percentageRollout.toTargetGroup')}
              addClearButton={addClearButton}
              disabled={disabled}
            />
          )}
          {!hideBucketBy && (
            <FormInput.Select
              name={prefix('bucketBy')}
              className={css.targetGroupAndBucketBy}
              items={bucketByItems}
              label={getString('cf.percentageRollout.bucketBy.label')}
              placeholder={getString('cf.percentageRollout.bucketBy.placeholder')}
              tooltipProps={{ dataTooltipId: 'ff_bucketBy_field' }}
              disabled={disabled}
            />
          )}
        </Layout.Horizontal>
      )}

      <Container className={css.distribution} width={distributionWidth}>
        <DistributionBar distributionSegments={distributionSegments} />

        <div>{total}%</div>

        {variations.map((variation, index) => (
          <div className={css.variationRow} key={variation.identifier}>
            <FormInput.Text
              inline
              name={prefix(`variations[${index}].weight`)}
              aria-label={variation.name || variation.identifier}
              inputGroup={{ type: 'number', max: 100, min: 0 }}
              disabled={disabled}
            />
            <Text
              padding={{ left: 'medium' }}
              inline
              icon="full-circle"
              iconProps={{ color: CFVariationColorsColorRef[index % CFVariationColorsColorRef.length] }}
              color={Color.GREY_600}
              font={{ variation: FontVariation.FORM_INPUT_TEXT }}
            >
              {variation.name || variation.identifier}
            </Text>
          </div>
        ))}
      </Container>
    </Layout.Vertical>
  )
}

export default PercentageRollout

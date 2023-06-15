/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Link, useParams } from 'react-router-dom'
import type { Feature } from 'services/cf'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import routes from '@common/RouteDefinitions'

export interface FlagDetailsCellProps {
  row: { original: Feature }
}

export const FlagDetailsCell: FC<FlagDetailsCellProps> = ({
  row: {
    original: { identifier, name, description }
  }
}) => {
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { withActiveEnvironment } = useActiveEnvironment()

  return (
    <>
      <Link
        target="_blank"
        to={withActiveEnvironment(
          routes.toCFFeatureFlagsDetail({
            featureFlagIdentifier: identifier,
            orgIdentifier: orgIdentifier,
            projectIdentifier: projectIdentifier,
            accountId: accountIdentifier
          })
        )}
      >
        <Text lineClamp={1} font={{ variation: FontVariation.BODY2 }} color={Color.PRIMARY_7}>
          {name}
        </Text>
      </Link>
      {description && <Text lineClamp={2}>{description}</Text>}
    </>
  )
}

export default FlagDetailsCell

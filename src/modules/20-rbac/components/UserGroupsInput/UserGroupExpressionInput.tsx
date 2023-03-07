/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { ExpressionInput, FormInput } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { ExpressionsListInput } from '@common/components/ExpressionsListInput/ExpressionsListInput'
import type { Extended } from './FormMultitypeUserGroupInput'

export enum ExpressionTypes {
  'Individual' = 'Individual',
  'Combined' = 'Combined'
}

const UserGroupExpressionInput: React.FC<Extended> = props => {
  const { disabled, name, formik, expressions } = props
  const value = get(formik.values, name, '')
  const userGroupExpression = get(formik.values, 'userGroupExpression', ExpressionTypes.Individual)
  const { getString } = useStrings()
  return (
    <>
      <FormInput.RadioGroup
        name="userGroupExpression"
        radioGroup={{ inline: true }}
        items={[
          { label: getString('common.individualExpression'), value: ExpressionTypes.Individual },
          { label: getString('common.combinedExpression'), value: ExpressionTypes.Combined }
        ]}
      />

      {userGroupExpression === ExpressionTypes.Individual ? (
        <ExpressionsListInput name={name} value={value} readOnly={disabled} expressions={expressions} />
      ) : (
        <ExpressionInput
          name={name}
          value={value}
          disabled={disabled}
          items={expressions}
          onChange={val =>
            /* istanbul ignore next */
            formik?.setFieldValue(name, val)
          }
        />
      )}
    </>
  )
}

export default UserGroupExpressionInput

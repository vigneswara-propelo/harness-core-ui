/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, PropsWithChildren } from 'react'
import { Form, Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MockFeature from '@cf/utils/testData/data/mockFeature'
import FlagChangesContextProvider, { FlagChangesContextProviderProps } from '../../../FlagChangesContextProvider'

export type SubSectionTestWrapperProps = PropsWithChildren<FlagChangesContextProviderProps>

const SubSectionTestWrapper: FC<Partial<SubSectionTestWrapperProps>> = props => (
  <TestWrapper>
    <Formik initialValues={{}} onSubmit={jest.fn()}>
      <Form>
        <FlagChangesContextProvider
          flag={MockFeature}
          environmentIdentifier="env1"
          mode={StepViewType.Edit}
          {...props}
        />
      </Form>
    </Formik>
  </TestWrapper>
)

export default SubSectionTestWrapper

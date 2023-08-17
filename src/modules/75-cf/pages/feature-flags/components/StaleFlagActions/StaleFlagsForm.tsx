/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, PropsWithChildren, useMemo } from 'react'
import { Formik } from 'formik'
import { useIsStaleFlagsView } from '@cf/pages/feature-flags/hooks/useIsStaleFlagsView'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { Feature } from 'services/cf'

export interface StaleFlagsFormProps {
  flags?: Feature[]
}

const StaleFlagsForm: FC<PropsWithChildren<StaleFlagsFormProps>> = ({ flags = [], children }) => {
  const isStaleFlagsView = useIsStaleFlagsView()
  const isFlagCleanupEnabled = useFeatureFlag(FeatureFlag.FFM_8344_FLAG_CLEANUP)

  const initialValues = useMemo(() => {
    if (!isStaleFlagsView || !isFlagCleanupEnabled) {
      return { staleFlags: {} }
    }

    return { staleFlags: flags.reduce((staleFlags, flag) => ({ ...staleFlags, [flag.identifier]: false }), {}) }
  }, [flags, isFlagCleanupEnabled, isStaleFlagsView])

  if (!isFlagCleanupEnabled || !isStaleFlagsView) {
    return <>{children}</>
  }

  return (
    <Formik initialValues={initialValues} onSubmit={() => void 0} enableReinitialize>
      {children}
    </Formik>
  )
}

export default StaleFlagsForm

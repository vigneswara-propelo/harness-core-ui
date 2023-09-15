/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable import/no-unresolved */
import React, { memo, ReactElement, lazy } from 'react'
import { customComponents, customFunctions, customHooks } from '@iacm/utils/IACMChildAppUtils'
import type { IACMCustomMicroFrontendProps } from '@iacm/interfaces/IACMCustomMicroFrontendProps.types'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import ExecFactory from '@pipeline/factories/ExecutionFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ConsoleViewStepDetailProps, StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { String } from 'framework/strings'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

const RemoteIACMApp = lazy(() => import('iacm/MicroFrontendApp'))

export const IACMApp = (): React.ReactElement => (
  <ChildAppMounter<IACMCustomMicroFrontendProps>
    ChildApp={RemoteIACMApp}
    customComponents={customComponents}
    customFunctions={customFunctions}
    customHooks={customHooks}
  />
)

export const IACMComponentMap = {
  IACMStage: lazy(() => import('iacm/IACMStage')),
  RemoteIACMApproval: lazy(() => import('iacm/IACMApproval')),
  RemoteIACMApprovalConsoleView: lazy(() => import('iacm/IACMApprovalConsoleView'))
}

export const IACMComponentMounter = <T,>(props: {
  component: keyof typeof IACMComponentMap
  childProps: T
}): React.ReactElement => {
  const { component, childProps, ...rest } = props
  const Component = IACMComponentMap[component]
  return (
    <ChildAppMounter<IACMCustomMicroFrontendProps>
      ChildApp={RemoteIACMApp}
      customComponents={customComponents}
      customFunctions={customFunctions}
      customHooks={customHooks}
      {...rest}
    >
      <Component {...childProps} />
    </ChildAppMounter>
  )
}

RbacFactory.registerResourceCategory(ResourceCategory.IACM, {
  icon: 'iacm',
  label: 'common.iacmText'
})

RbacFactory.registerResourceTypeHandler(ResourceType.IAC_STACK, {
  icon: 'nav-settings',
  label: 'iacm.permissions.iacmWorkspaces',
  labelSingular: 'iacm.permissions.iacmWorkspace',
  category: ResourceCategory.IACM,
  permissionLabels: {
    [PermissionIdentifier.IAC_VIEW_STACK]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.IAC_EDIT_STACK]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.IAC_DELETE_STACK]: <String stringID="rbac.permissionLabels.delete" />
  }
})

const IACMApproval = (props: StepDetailProps): ReactElement => (
  <IACMComponentMounter component="RemoteIACMApproval" childProps={props} />
)

const IACMApprovalLogview = (props: ConsoleViewStepDetailProps): ReactElement => (
  <IACMComponentMounter component="RemoteIACMApprovalConsoleView" childProps={props} />
)

ExecFactory.registerStepDetails(StepType.IACMApproval, {
  component: memo(IACMApproval)
})

ExecFactory.registerConsoleViewStepDetails(StepType.IACMApproval, {
  component: memo(IACMApprovalLogview)
})

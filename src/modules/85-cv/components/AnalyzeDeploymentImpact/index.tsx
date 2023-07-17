/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import factory from '@pipeline/factories/ExecutionFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import AnalyzeDeploymentImpact from './AnalyzeDeploymentImpact'
import AnalyzeDeploymentImpactConsoleView from './AnalyzeDeploymentImpactConsoleView'

factory.registerStepDetails(StepType.AnalyzeDeploymentImpact, {
  component: AnalyzeDeploymentImpact
})

factory.registerConsoleViewStepDetails(StepType.AnalyzeDeploymentImpact, {
  component: AnalyzeDeploymentImpactConsoleView
})

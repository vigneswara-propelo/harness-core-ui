/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import BlueGreenVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Blue-Green-deployment.mp4'
import CanaryVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Canary-deployment.mp4'
import RollingUpdateVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Rolling-Update-deployment.mp4'
import { KubernetesType } from '@delegates/constants'
import type { EntityMap, DeploymentStrategyTypes, DeploymentFlowType } from './types'

export const SERVICE_TYPES: EntityMap = {
  KubernetesService: { id: 'KubernetesService', label: 'Kubernetes Service', icon: 'app-kubernetes' },
  ServerslessFunction: { id: 'ServerlessFunction', label: 'Serverless Function', icon: 'serverless-deploy-step' },
  TraditionalApp: { id: 'TraditionalApp', label: 'Traditional App', icon: 'square' }
}

export const INFRA_TYPES: { [key: string]: EntityMap } = {
  KubernetesService: {
    KubernetesManifest: {
      id: KubernetesType.KUBERNETES_MANIFEST,
      label: 'Kubernetes Manifest',
      icon: 'app-kubernetes'
    },
    HelmChart: { id: KubernetesType.HELM_CHART, label: 'Helm Chart', icon: 'service-helm' },
    Kustomize: { id: 'Kustomize', label: 'Kustomize', icon: 'kustamize' },
    OpenShiftTemplate: { id: 'OpenShiftTemplate', label: 'OpenShift Template', icon: 'openshift' }
  }
}

export enum DEPLOYMENT_FLOW_ENUMS {
  CDPipeline = 'cd-pipeline',
  Gitops = 'gitops'
}
export enum DEPLOYMENT_STRATEGY_ENUMS {
  Canary = 'canary',
  BlueGreen = 'blueGreen',
  Rolling = 'rolling'
}
export const DEPLOYMENT_STRATEGY_TYPES: {
  [key: string]: DeploymentStrategyTypes
} = {
  Canary: {
    id: 'Canary',
    label: 'Canary',
    icon: 'canary-icon',
    subtitle:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.deploymentStrategies.canary.subtitle',
    steps: [
      {
        title: 'Canary deployment',
        description: 'pipeline.executionStrategy.strategies.canary.steps.step1.description'
      },
      { title: 'Canary delete', description: 'pipeline.executionStrategy.strategies.canary.steps.step2.description' },
      { title: 'Rolling Update', description: 'pipeline.executionStrategy.strategies.canary.steps.step3.description' }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.createpipeline.createcanarycmd'
  },
  BlueGreen: {
    id: 'BlueGreen',
    label: 'Blue Green',
    icon: 'blue-green',
    subtitle:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.deploymentStrategies.blueGreen.subtitle',
    steps: [
      { title: 'Step 1', description: 'pipeline.executionStrategy.strategies.rolling.steps.step1.description' },
      { title: 'Step 2', description: 'pipeline.executionStrategy.strategies.rolling.steps.step2.description' },
      {
        title: 'Step 3',
        description: 'pipeline.executionStrategy.strategies.rolling.steps.step3.description'
      }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.createpipeline.createbluegreencmd'
  },
  Rolling: {
    id: 'Rolling',
    label: 'Rolling Update',
    icon: 'rolling-update',
    subtitle:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.deploymentStrategies.rolling.subtitle',
    steps: [
      { title: 'Step 1', description: 'pipeline.executionStrategy.strategies.blueGreen.steps.step1.description' },
      { title: 'Step 2', description: 'pipeline.executionStrategy.strategies.blueGreen.steps.step2.description' },
      {
        title: 'Step 3',
        description: 'pipeline.executionStrategy.strategies.blueGreen.steps.step3.description'
      }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.createpipeline.createrollingcmd'
  }
}
export const DEPLOYMENT_FLOW_TYPES: { [key in DEPLOYMENT_FLOW_ENUMS]: DeploymentFlowType } = {
  [DEPLOYMENT_FLOW_ENUMS.Gitops]: {
    id: DEPLOYMENT_FLOW_ENUMS.Gitops,
    label: 'CD Gitops',
    icon: 'slot-deployment',
    subtitle: 'Connect with a GitOps agent'
  },
  [DEPLOYMENT_FLOW_ENUMS.CDPipeline]: {
    id: DEPLOYMENT_FLOW_ENUMS.CDPipeline,
    label: 'CD Pipeline',
    icon: 'ci-build-pipeline',
    subtitle: 'Connect with a Kubernetes Delegate '
  }
}

export const StrategyVideoByType: { [key: string]: string } = {
  BlueGreen: BlueGreenVideo,
  Rolling: RollingUpdateVideo,
  Canary: CanaryVideo
}

export const MAX_DELETAGE_POLL_COUNT = 10
export const DELETAGE_POLL_COUNT_INTERVAL_MS = 3000

export const PIPELINE_TO_STRATEGY_MAP: { [key: string]: string } = {
  Canary: 'guestbook_canary_pipeline',
  BlueGreen: 'guestbook_bluegreen_pipeline',
  Rolling: 'guestbook_rolling_pipeline'
}

export const DEFAULT_IDENTIFIER = 'default'
export const API_KEY_TYPE = 'USER'
export const DEFAULT_TOKEN_IDENTIFIER = 'default-token'
export const TOKEN_MASK = 'XXXXXXX.XXXX.XXXXXX'

export const SYSTEM_ARCH_TYPES: { [key: string]: string } = {
  ARM: 'ARM',
  AMD: 'AMD'
}

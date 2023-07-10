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
    subtitle: 'Gradually release updates to minimize risks',
    steps: [
      { title: 'Canary deployment', description: 'Add canary pods until they guarantee you their safety' },
      { title: 'Canary delete', description: 'Update 50% new instances in phase 2 and verify it.' },
      { title: 'Rolling Update', description: 'Update all new instances in phase 3 and verify it.' }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.createpipeline.createcanarycmd'
  },
  BlueGreen: {
    id: 'BlueGreen',
    label: 'Blue Green',
    icon: 'blue-green',
    subtitle: 'Seamlessly switch between identical environments',
    steps: [
      { title: 'Step 1', description: 'Maintain two identical fleets of servers.' },
      { title: 'Step 2', description: 'Verify the services in blue environment.' },
      {
        title: 'Step 3',
        description: 'After verification, switch the load balancer to point to newly-deployed fleet.'
      }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.createpipeline.createbluegreencmd'
  },
  Rolling: {
    id: 'Rolling',
    label: 'Rolling Update',
    icon: 'rolling-update',
    subtitle: 'Continuously roll out updates without downtime',
    steps: [
      { title: 'Step 1', description: 'Test the new version.' },
      { title: 'Step 2', description: 'Approve the new version.' },
      {
        title: 'Step  3',
        description: 'Replace new version.'
      }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.createpipeline.createrollingcmd'
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

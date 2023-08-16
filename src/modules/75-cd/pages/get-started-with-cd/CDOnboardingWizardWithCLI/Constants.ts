/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { StringsMap } from 'stringTypes'
import BlueGreenVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Blue-Green-deployment.mp4'
import CanaryVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Canary-deployment.mp4'
import RollingUpdateVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Rolling-Update-deployment.mp4'
import HelmDeploymentBasic from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Helm-Deployment-basic.mp4'
import { DelegateCommandLineTypes, KubernetesType } from '@delegates/constants'
import {
  EntityMap,
  DeploymentStrategyTypes,
  DeploymentFlowType,
  CLOUD_FUNCTION_TYPES,
  SERVERLESS_FUNCTIONS
} from './types'
import css from './CDOnboardingWizardWithCLI.module.scss'
interface KVPair {
  [key: string]: string
}
export const SERVICE_TYPES: EntityMap = {
  KubernetesService: { id: 'KubernetesService', label: 'cd.getStartedWithCD.k8sService', icon: 'app-kubernetes' },
  ServerlessFunction: {
    id: 'ServerlessFunction',
    label: 'cd.getStartedWithCD.serverless',
    icon: 'serverless-deploy-step',
    className: css.blueIcons
  },
  TraditionalApp: {
    id: 'TraditionalApp',
    label: 'cd.getStartedWithCD.traditionalApp',
    icon: 'chaos-cube',
    className: css.blueIcons
  }
}

export const INFRA_TYPES: Record<string, EntityMap> = {
  KubernetesService: {
    KubernetesManifest: {
      id: KubernetesType.KUBERNETES_MANIFEST,
      label: 'pipeline.manifestTypeLabels.K8sManifest',
      icon: 'app-kubernetes'
    },
    HelmChart: { id: KubernetesType.HELM_CHART, label: 'common.HelmChartLabel', icon: 'service-helm' },
    Kustomize: { id: 'Kustomize', label: 'pipeline.manifestTypeLabels.KustomizeLabel', icon: 'kustamize' }
  },
  ServerlessFunction: {
    AWSLambda: {
      id: SERVERLESS_FUNCTIONS.AWS_LAMBDA_FUNCTION,
      label: 'cd.getStartedWithCD.awsLambda',
      icon: 'service-aws-lamda'
    },
    GCPFunction: {
      id: SERVERLESS_FUNCTIONS.GOOGLE_CLOUD_FUNCTION,
      label: 'cd.getStartedWithCD.googleFunction',
      icon: 'service-google-functions'
    }
  },
  TraditionalApp: {
    TraditionalAWS: {
      id: 'TraditionalAWS',
      label: 'cd.getStartedWithCD.traditionalAWS',
      icon: 'service-ec2'
    },
    TraditionalPhysical: {
      id: 'TraditionalPhysical',
      label: 'platform.connectors.title.pdcConnector',
      icon: 'chaos-cube'
    }
  }
}
export const INFRA_SUB_TYPES: Record<string, EntityMap> = {
  [KubernetesType.HELM_CHART]: {
    K8sHelm: {
      id: 'K8sHelm',
      label: 'cd.getStartedWithCD.k8sHelm',
      icon: 'app-kubernetes'
    },
    NativeHelm: { id: 'NativeHelm', label: 'pipeline.nativeHelm', icon: 'service-helm' }
  },
  [SERVERLESS_FUNCTIONS.AWS_LAMBDA_FUNCTION]: {
    [CLOUD_FUNCTION_TYPES.ServerLessLambda]: {
      id: CLOUD_FUNCTION_TYPES.ServerLessLambda,
      label: 'cd.getStartedWithCD.serverless',
      icon: 'service-serverless'
    },
    [CLOUD_FUNCTION_TYPES.NativeAWSLambda]: {
      id: CLOUD_FUNCTION_TYPES.NativeAWSLambda,
      label: 'cd.getStartedWithCD.nativeAWSLambda',
      icon: 'service-aws-lamda'
    }
  },
  [SERVERLESS_FUNCTIONS.GOOGLE_CLOUD_FUNCTION]: {
    [CLOUD_FUNCTION_TYPES.GCPGen1]: {
      id: CLOUD_FUNCTION_TYPES.GCPGen1,
      label: 'cd.getStartedWithCD.gcpGen1',
      icon: 'service-google-functions'
    },
    [CLOUD_FUNCTION_TYPES.GCPGen2]: {
      id: CLOUD_FUNCTION_TYPES.GCPGen2,
      label: 'cd.getStartedWithCD.gcpGen2',
      icon: 'service-google-functions'
    }
  }
}

export enum DEPLOYMENT_FLOW_ENUMS {
  CDPipeline = 'cd-pipeline',
  Gitops = 'gitops'
}
export enum DEPLOYMENT_STRATEGY_ENUMS {
  Canary = 'Canary',
  BlueGreen = 'BlueGreen',
  Rolling = 'Rolling',
  Basic = 'Basic'
}

export const DEPLOYMENT_STRATEGY_TYPES: {
  [key: string]: DeploymentStrategyTypes
} = {
  Canary: {
    id: 'Canary',
    label: 'canary',
    icon: 'canary-icon',
    subtitle:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.deploymentStrategies.canary.subtitle',
    steps: [
      {
        title: 'pipeline.executionStrategy.strategies.canary.steps.step1.title',
        description: 'pipeline.executionStrategy.strategies.canary.steps.step1.description'
      },
      {
        title: 'pipeline.executionStrategy.strategies.canary.steps.step2.title',
        description: 'pipeline.executionStrategy.strategies.canary.steps.step2.description'
      },
      {
        title: 'pipeline.executionStrategy.strategies.canary.steps.step3.title',
        description: 'pipeline.executionStrategy.strategies.canary.steps.step3.description'
      }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.createpipeline.createcanarycmd',
    pipelineName: 'canary-pipeline'
  },
  BlueGreen: {
    id: 'BlueGreen',
    label: 'pipeline.executionStrategy.strategies.blueGreen.title',
    icon: 'blue-green',
    subtitle:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.deploymentStrategies.blueGreen.subtitle',
    steps: [
      {
        title: 'pipeline.executionStrategy.strategies.common.steps.step1.title',
        description: 'pipeline.executionStrategy.strategies.rolling.steps.step1.description'
      },
      {
        title: 'pipeline.executionStrategy.strategies.common.steps.step2.title',
        description: 'pipeline.executionStrategy.strategies.rolling.steps.step2.description'
      },
      {
        title: 'pipeline.executionStrategy.strategies.common.steps.step3.title',
        description: 'pipeline.executionStrategy.strategies.rolling.steps.step3.description'
      }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.createpipeline.createbluegreencmd',
    pipelineName: 'bluegreen-pipeline'
  },
  Rolling: {
    id: 'Rolling',
    label: 'common.rolling',
    icon: 'rolling-update',
    subtitle:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.deploymentStrategies.rolling.subtitle',
    steps: [
      {
        title: 'pipeline.executionStrategy.strategies.common.steps.step1.title',
        description: 'pipeline.executionStrategy.strategies.blueGreen.steps.step1.description'
      },
      {
        title: 'pipeline.executionStrategy.strategies.common.steps.step2.title',
        description: 'pipeline.executionStrategy.strategies.blueGreen.steps.step2.description'
      },
      {
        title: 'pipeline.executionStrategy.strategies.common.steps.step3.title',
        description: 'pipeline.executionStrategy.strategies.blueGreen.steps.step3.description'
      }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.createpipeline.createrollingcmd',
    pipelineName: 'rolling-pipeline'
  },
  Basic: {
    id: 'Basic',
    label: 'common.basic',
    icon: 'basic-deployment',
    subtitle:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.deploymentStrategies.rolling.subtitle',
    steps: [
      {
        title: 'pipeline.executionStrategy.strategies.common.steps.step1.title',
        description: 'pipeline.executionStrategy.strategies.rolling.steps.step1.description'
      },
      {
        title: 'pipeline.executionStrategy.strategies.common.steps.step2.title',
        description: 'pipeline.executionStrategy.strategies.rolling.steps.step2.description'
      },
      {
        title: 'pipeline.executionStrategy.strategies.common.steps.step3.title',
        description: 'pipeline.executionStrategy.strategies.rolling.steps.step3.description'
      }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.createpipeline.createrollingcmd'
  }
}

export const DEPLOYMENT_FLOW_TYPES: { [key in DEPLOYMENT_FLOW_ENUMS]: DeploymentFlowType } = {
  [DEPLOYMENT_FLOW_ENUMS.Gitops]: {
    id: DEPLOYMENT_FLOW_ENUMS.Gitops,
    label: 'cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdGitops.heading',
    icon: 'slot-deployment',
    subtitle: 'cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdGitops.subtitle'
  },
  [DEPLOYMENT_FLOW_ENUMS.CDPipeline]: {
    id: DEPLOYMENT_FLOW_ENUMS.CDPipeline,
    label: 'cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdPipeline.title',
    icon: 'ci-build-pipeline',
    subtitle: 'cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdPipeline.subtitle'
  }
}

export const StrategyVideoByType: KVPair = {
  BlueGreen: BlueGreenVideo,
  Rolling: RollingUpdateVideo,
  Canary: CanaryVideo,
  Basic: HelmDeploymentBasic
}

export const MAX_DELETAGE_POLL_COUNT = 10
export const DELETAGE_POLL_COUNT_INTERVAL_MS = 3000

export const PIPELINE_TO_STRATEGY_MAP: Record<string, string> = {
  Canary: 'guestbook_canary_pipeline',
  BlueGreen: 'guestbook_bluegreen_pipeline',
  Rolling: 'guestbook_rolling_pipeline',
  Basic: 'hello_world'
}

export const DEFAULT_IDENTIFIER = 'default'
export const API_KEY_TYPE = 'USER'
export const DEFAULT_TOKEN_IDENTIFIER = 'default-token'
export const TOKEN_MASK = 'XXXXXXX.XXXX.XXXXXX'

export const SYSTEM_ARCH_TYPES: KVPair = {
  ARM: 'ARM',
  AMD: 'AMD'
}

export const DEPLOYMENT_TYPE_TO_DIR_MAP: Record<string, string> = {
  Kustomize: 'kustomize-guestbook',
  [KubernetesType.HELM_CHART]: 'helm-guestbook',
  [KubernetesType.KUBERNETES_MANIFEST]: 'guestbook',
  [CLOUD_FUNCTION_TYPES.GCPGen1]: 'google_cloud_function',
  [CLOUD_FUNCTION_TYPES.GCPGen2]: 'google_cloud_function',
  [CLOUD_FUNCTION_TYPES.NativeAWSLambda]: 'aws-lambda/harnesscd-pipeline',
  [CLOUD_FUNCTION_TYPES.ServerLessLambda]: 'serverless-lambda/harnesscd-pipeline'
}

export const DEPLOYMENT_TYPE_TO_FILE_MAPS: Record<string, Record<string, string>> = {
  K8sHelm: {
    service: 'service-blucan',
    infrastructure: 'infrastructure-definition-blucan',
    [DEPLOYMENT_STRATEGY_ENUMS.BlueGreen]: 'bluegreen-pipeline',
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'canary-pipeline',
    env: 'environment-blucan'
  },
  NativeHelm: {
    service: 'service-rolling',
    infrastructure: 'infrastructure-definition-rolling',
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'rolling-pipeline',
    env: 'environment-rolling'
  },
  [CLOUD_FUNCTION_TYPES.GCPGen1]: {
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: '1st_gen/basic-pipeline'
  },
  [CLOUD_FUNCTION_TYPES.GCPGen2]: {
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: '2nd_gen/basic-pipeline',
    [DEPLOYMENT_STRATEGY_ENUMS.BlueGreen]: '2nd_gen/bluegreen-pipeline',
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: '2nd_gen/canary-pipeline'
  },
  [CLOUD_FUNCTION_TYPES.ServerLessLambda]: {
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'serverless-deployment'
  },
  [CLOUD_FUNCTION_TYPES.NativeAWSLambda]: {
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'pipeline'
  }
}

export const ARTIFACT_STRINGS_MAP_BY_TYPE: Record<string, Record<string, keyof StringsMap>> = {
  KubernetesService: {
    svcrep: 'cd.getStartedWithCD.flowByQuestions.what.K8sSteps.k8sSvcRep',
    svcsubtext: 'cd.getStartedWithCD.flowByQuestions.what.K8sSteps.artifact'
  },
  ServerlessFunction: {
    svcrep: 'cd.getStartedWithCD.flowByQuestions.what.ServerlessSteps.svcrep'
  },
  [KubernetesType.HELM_CHART]: {
    artifact: 'cd.getStartedWithCD.flowByQuestions.what.K8sSteps.k8sHelm'
  },
  [SERVERLESS_FUNCTIONS.AWS_LAMBDA_FUNCTION]: {
    artifact: 'cd.getStartedWithCD.flowByQuestions.what.ServerlessSteps.artifactaws'
  },
  [SERVERLESS_FUNCTIONS.GOOGLE_CLOUD_FUNCTION]: {
    artifact: 'cd.getStartedWithCD.flowByQuestions.what.ServerlessSteps.artifactgcf'
  },
  TraditionalApp: {
    svcrep: 'cd.getStartedWithCD.flowByQuestions.what.TraditionalApp.artifact'
  }
}

export const SWIMLANE_DOCS_LINK: {
  [key: string]: {
    isInComplete: boolean
    link: string
  }
} = {
  TraditionalAWS: {
    isInComplete: true,
    link: 'https://developer.harness.io/tutorials/cd-pipelines/vm/aws'
  },
  TraditionalPhysical: {
    isInComplete: true,
    link: 'https://developer.harness.io/tutorials/cd-pipelines/vm/pdc'
  }
}

export const INFRA_TO_STRING_MAP: Record<string, string> = {
  [CLOUD_FUNCTION_TYPES.GCPGen1]:
    'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless'
}
export const DELEGATE_TYPE_BY_ARTIFACT_MAP: Record<string, string[]> = {
  [CLOUD_FUNCTION_TYPES.GCPGen1]: [DelegateCommandLineTypes.DOCKER],
  [CLOUD_FUNCTION_TYPES.GCPGen2]: [DelegateCommandLineTypes.DOCKER],
  [CLOUD_FUNCTION_TYPES.NativeAWSLambda]: [DelegateCommandLineTypes.DOCKER],
  [CLOUD_FUNCTION_TYPES.ServerLessLambda]: [DelegateCommandLineTypes.DOCKER],
  [KubernetesType.KUBERNETES_MANIFEST]: [DelegateCommandLineTypes.KUBERNETES],
  [KubernetesType.HELM_CHART]: [DelegateCommandLineTypes.KUBERNETES],
  Kustomize: [DelegateCommandLineTypes.KUBERNETES]
}

export const DEPLOYMENT_TYPE_MAP: Record<string, string[]> = {
  K8sHelm: ['Canary', 'BlueGreen'],
  NativeHelm: ['Rolling'],
  [KubernetesType.KUBERNETES_MANIFEST]: ['Canary', 'BlueGreen', 'Rolling'],
  Kustomize: ['Canary', 'BlueGreen', 'Rolling'],
  [SERVERLESS_FUNCTIONS.AWS_LAMBDA_FUNCTION]: ['Canary', 'BlueGreen', 'Rolling'],
  NativeAWSLambda: ['Basic'],
  ServerLessLambda: ['Basic'],
  GCPGen2: ['Canary', 'BlueGreen', 'Basic'],
  GCPGen1: ['Basic']
}
export const PIPELINE_IDS_BY_ARTIFACT_STRATEGY_MAP: Record<string, Record<string, string>> = {
  [KubernetesType.KUBERNETES_MANIFEST]: {
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'guestbook_rolling_pipeline',
    [DEPLOYMENT_STRATEGY_ENUMS.BlueGreen]: 'guestbook_bluegreen_pipeline',
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'guestbook_canary_pipeline'
  },
  K8sHelm: {
    [DEPLOYMENT_STRATEGY_ENUMS.BlueGreen]: 'guestbook_bluegreen_pipeline',
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'guestbook_canary_pipeline'
  },
  NativeHelm: {
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'guestbook_rolling_pipeline'
  },
  Kustomize: {
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'guestbook_rolling_pipeline',
    [DEPLOYMENT_STRATEGY_ENUMS.BlueGreen]: 'guestbook_bluegreen_pipeline',
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'guestbook_canary_pipeline'
  },
  [CLOUD_FUNCTION_TYPES.GCPGen1]: {
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'hello_world'
  },
  [CLOUD_FUNCTION_TYPES.GCPGen2]: {
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'Canary',
    [DEPLOYMENT_STRATEGY_ENUMS.BlueGreen]: 'bluegreen',
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'basic'
  },
  [CLOUD_FUNCTION_TYPES.NativeAWSLambda]: {
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'nativeawslambda'
  },
  [CLOUD_FUNCTION_TYPES.ServerLessLambda]: {
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'serverlessdemo'
  }
}

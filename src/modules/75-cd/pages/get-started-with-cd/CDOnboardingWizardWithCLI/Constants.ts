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
      label: 'common.aws',
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
      label: 'cd.getStartedWithCD.serverlesscom',
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
  },
  TraditionalPhysical: {
    SSH: {
      id: 'SSH',
      label: 'SSH',
      icon: 'secret-ssh'
    },
    WINRM: {
      id: 'WINRM',
      label: 'pipeline.serviceDeploymentTypes.winrm',
      icon: 'command-winrm'
    }
  },
  TraditionalAWS: {
    SSH_AWS: {
      id: 'SSH_AWS',
      label: 'SSH',
      icon: 'secret-ssh'
    },
    WINRM_AWS: {
      id: 'WINRM_AWS',
      label: 'pipeline.serviceDeploymentTypes.winrm',
      icon: 'command-winrm'
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
  [DEPLOYMENT_FLOW_ENUMS.CDPipeline]: {
    id: DEPLOYMENT_FLOW_ENUMS.CDPipeline,
    label: 'cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdPipeline.title',
    icon: 'ci-build-pipeline',
    subtitle: 'cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdPipeline.subtitle'
  },
  [DEPLOYMENT_FLOW_ENUMS.Gitops]: {
    id: DEPLOYMENT_FLOW_ENUMS.Gitops,
    label: 'cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdGitops.heading',
    icon: 'gitops-blue',
    subtitle: 'cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdGitops.subtitle'
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
  K8sHelm: 'helm-guestbook',
  NativeHelm: 'helm-guestbook',
  [KubernetesType.KUBERNETES_MANIFEST]: 'guestbook',
  [CLOUD_FUNCTION_TYPES.GCPGen1]: 'google_cloud_function',
  [CLOUD_FUNCTION_TYPES.GCPGen2]: 'google_cloud_function',
  [CLOUD_FUNCTION_TYPES.NativeAWSLambda]: 'aws-lambda/harnesscd-pipeline',
  [CLOUD_FUNCTION_TYPES.ServerLessLambda]: 'serverless-lambda/harnesscd-pipeline',
  SSH: 'vm-pdc/ssh',
  WINRM: 'vm-pdc/winrm',
  SSH_AWS: 'vm-aws/ssh',
  WINRM_AWS: 'vm-aws/winrm'
}

export const DEPLOYMENT_TYPE_TO_FILE_MAPS: Record<string, Record<string, string>> = {
  K8sHelm: {
    service: 'k8s-service',
    infrastructure: 'k8s-infrastructure-definition',
    [DEPLOYMENT_STRATEGY_ENUMS.BlueGreen]: 'k8s-bluegreen-pipeline',
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'k8s-canary-pipeline',
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'k8s-rolling-pipeline',
    env: 'k8s-environment'
  },
  NativeHelm: {
    service: 'nativehelm-service',
    infrastructure: 'nativehelm-infrastructure-definition',
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'nativehelm-rolling-pipeline',
    env: 'nativehelm-environment'
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
  },
  SSH: {
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'pipeline-ssh-basic',
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'pipeline-ssh-rolling',
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'pipeline-ssh-canary'
  },
  WINRM: {
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'pipeline-basic',
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'pipeline-rolling',
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'pipeline-canary'
  },
  SSH_AWS: {
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'pipeline-ssh-basic',
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'pipeline-ssh-rolling',
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'pipeline-ssh-canary'
  },
  WINRM_AWS: {
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'pipeline-basic',
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'pipeline-rolling',
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'pipeline-canary'
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
    svcrep: 'cd.getStartedWithCD.flowByQuestions.what.TraditionalApp.svcrep'
  },
  TraditionalPhysical: {
    artifact: 'cd.getStartedWithCD.flowByQuestions.what.TraditionalApp.artifact'
  },
  TraditionalAWS: {
    artifact: 'cd.getStartedWithCD.flowByQuestions.what.TraditionalApp.artifactaws'
  }
}

export const SWIMLANE_DOCS_LINK: {
  [key: string]: {
    isInComplete: boolean
    link: string
  }
} = {
  TraditionalPhysical: {
    isInComplete: false,
    link: 'https://developer.harness.io/tutorials/cd-pipelines/vm/pdc'
  },
  TraditionalAWS: {
    isInComplete: false,
    link: 'https://developer.harness.io/tutorials/cd-pipelines/vm/aws'
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
  Kustomize: [DelegateCommandLineTypes.KUBERNETES],
  SSH: [DelegateCommandLineTypes.DOCKER],
  WINRM: [DelegateCommandLineTypes.DOCKER],
  SSH_AWS: [DelegateCommandLineTypes.DOCKER],
  WINRM_AWS: [DelegateCommandLineTypes.DOCKER]
}

export const DEPLOYMENT_TYPE_MAP: Record<string, string[]> = {
  K8sHelm: ['Canary', 'BlueGreen', 'Rolling'],
  NativeHelm: ['Rolling'],
  [KubernetesType.KUBERNETES_MANIFEST]: ['Canary', 'BlueGreen', 'Rolling'],
  Kustomize: ['Canary', 'BlueGreen', 'Rolling'],
  [SERVERLESS_FUNCTIONS.AWS_LAMBDA_FUNCTION]: ['Canary', 'BlueGreen', 'Rolling'],
  NativeAWSLambda: ['Basic'],
  ServerLessLambda: ['Basic'],
  GCPGen2: ['Canary', 'BlueGreen', 'Basic'],
  GCPGen1: ['Basic'],
  SSH: ['Basic', 'Canary', 'Rolling'],
  WINRM: ['Basic', 'Canary', 'Rolling'],
  WINRM_AWS: ['Basic', 'Canary', 'Rolling'],
  SSH_AWS: ['Basic', 'Canary', 'Rolling']
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
  },
  SSH: {
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'pipeline-ssh-canary',
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'pipeline-ssh-rolling',
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'pipeline-ssh-basic'
  },
  WINRM: {
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'pipeline-canary',
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'pipeline-rolling',
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'pipeline-basic'
  },
  SSH_AWS: {
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'pipeline-ssh-canary',
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'pipeline-ssh-rolling',
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'pipeline-ssh-basic'
  },
  WINRM_AWS: {
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'pipeline-canary',
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'pipeline-rolling',
    [DEPLOYMENT_STRATEGY_ENUMS.Basic]: 'pipeline-basic'
  }
}

export const ARTIFACT_BY_APP_LABEL_MAP: Record<string, keyof StringsMap> = {
  [SERVERLESS_FUNCTIONS.AWS_LAMBDA_FUNCTION]: 'cd.getStartedWithCD.awsLambda',
  [SERVERLESS_FUNCTIONS.GOOGLE_CLOUD_FUNCTION]: 'cd.getStartedWithCD.googleFunction',
  [KubernetesType.HELM_CHART]: 'common.microservice',
  Kustomize: 'common.microservice',
  [KubernetesType.KUBERNETES_MANIFEST]: 'common.microservice',
  TraditionalAWS: 'common.application',
  TraditionalPhysical: 'common.application'
}

export const GITOPS_DIRECTORY_PATH: Record<string, string> = {
  K8sHelm: 'helm-guestbook',
  NativeHelm: 'helm-guestbook',
  Kustomize: 'kustomize-guestbook',
  [KubernetesType.KUBERNETES_MANIFEST]: 'guestbook'
}

export const GITOPS_ENTITY_IDS_BY_DEPLOYMENT_TYPE: Record<
  string,
  { application: string; cluster: string; repo: string }
> = {
  K8sHelm: {
    application: 'gitops-helm-application',
    cluster: 'gitopscluster',
    repo: 'gitopsrepo'
  },
  NativeHelm: {
    application: 'gitops-helm-application',
    cluster: 'gitopscluster',
    repo: 'gitopsrepo'
  },
  Kustomize: {
    application: 'gitops-kustomize-application',
    cluster: 'gitopscluster',
    repo: 'gitopsrepo'
  },
  [KubernetesType.KUBERNETES_MANIFEST]: {
    application: 'gitops-application',
    cluster: 'gitopscluster',
    repo: 'gitopsrepo'
  }
}

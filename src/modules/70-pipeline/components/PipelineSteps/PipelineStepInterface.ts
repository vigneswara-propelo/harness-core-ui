/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { PipelineInfrastructure } from 'services/cd-ng'

export enum StepType {
  GitOpsSync = 'GitOpsSync',
  RevertPR = 'RevertPR',
  StageRuntimeInput = 'StageRuntimeInput',
  HTTP = 'Http',
  SHELLSCRIPT = 'ShellScript',
  Container = 'Container',
  InitContainer = 'InitContainer',
  RunContainer = 'RunContainer',
  GitOpsUpdateReleaseRepo = 'GitOpsUpdateReleaseRepo',
  GitOpsFetchLinkedApps = 'GitOpsFetchLinkedApps',
  Command = 'Command',
  Email = 'Email',
  CustomApproval = 'CustomApproval',
  Barrier = 'Barrier',
  Queue = 'Queue',
  K8sRollingRollback = 'K8sRollingRollback',
  K8sBlueGreenDeploy = 'K8sBlueGreenDeploy',
  K8sCanaryDeploy = 'K8sCanaryDeploy',
  K8sBGSwapServices = 'K8sBGSwapServices',
  K8sScale = 'K8sScale',
  K8sApply = 'K8sApply',
  K8sCanaryDelete = 'K8sCanaryDelete',
  K8sDelete = 'K8sDelete',
  K8sDryRun = 'K8sDryRun',
  StepGroup = 'StepGroup',
  DeployServiceEntity = 'DeployServiceEntity',
  DeployService = 'DeployService',
  DeployEnvironment = 'DeployEnvironment',
  DeployEnvironmentGroup = 'DeployEnvironmentGroup',
  DeployEnvironmentEntity = 'DeployEnvironmentEntity',
  DeployInfrastructure = 'DeployInfrastructure',
  DeployInfrastructureEntity = 'DeployInfrastructureEntity',
  DeployClusterEntity = 'DeployClusterEntity',
  InlineEntityFilters = 'InlineEntityFilters',
  KubernetesDirect = 'KubernetesDirect',
  K8sServiceSpec = 'K8sServiceSpec',
  K8sRollingDeploy = 'K8sRollingDeploy',
  K8sBlueGreenStageScaleDown = 'K8sBlueGreenStageScaleDown',
  CustomVariable = 'CustomVariable',
  ServerlessAwsLambda = 'ServerlessAwsLambda',
  ServerlessGCP = 'ServerlessGCP',
  ServerlessAzure = 'ServerlessAzure',
  Dependency = 'Service',
  Plugin = 'Plugin',
  GHAPlugin = 'Action',
  BitrisePlugin = 'Bitrise',
  GitClone = 'GitClone',
  Run = 'Run',
  GAR = 'BuildAndPushGAR',
  GCR = 'BuildAndPushGCR',
  ACR = 'BuildAndPushACR',
  PDC = 'Pdc',
  SshWinRmAws = 'SshWinRmAws',
  ECR = 'BuildAndPushECR',
  SaveCacheGCS = 'SaveCacheGCS',
  RestoreCacheGCS = 'RestoreCacheGCS',
  SaveCacheS3 = 'SaveCacheS3',
  RestoreCacheS3 = 'RestoreCacheS3',
  SaveCacheHarness = 'SaveCacheHarness',
  RestoreCacheHarness = 'RestoreCacheHarness',
  DockerHub = 'BuildAndPushDockerRegistry',
  GCS = 'GCSUpload',
  S3 = 'S3Upload',
  JFrogArtifactory = 'ArtifactoryUpload',
  RunTests = 'RunTests',
  HelmDeploy = 'HelmDeploy',
  HelmRollback = 'HelmRollback',
  HarnessApproval = 'HarnessApproval',
  JiraApproval = 'JiraApproval',
  ServiceNowApproval = 'ServiceNowApproval',
  ServiceNowCreate = 'ServiceNowCreate',
  ServiceNowUpdate = 'ServiceNowUpdate',
  ServiceNowImportSet = 'ServiceNowImportSet',
  Verify = 'Verify',
  AnalyzeDeploymentImpact = 'AnalyzeDeploymentImpact',
  JiraCreate = 'JiraCreate',
  JiraUpdate = 'JiraUpdate',
  TERRAFORM_ROLLBACK_V2 = 'TerraformRollback',
  TERRAFORM_DESTROY_V2 = 'TerraformDestroy',
  TERRAFORM_PLAN_V2 = 'TerraformPlan',
  TERRAFORM_APPLY_V2 = 'TerraformApply',
  K8S_BLUE_GREEN_V2 = 'K8sBlueGreenDeploy',
  K8S_BG_SWAP_SERVICES_V2 = 'K8sBGSwapServices',
  K8S_CANARY_V2 = 'K8sCanaryDeploy',
  K8S_CANARY_DELETE_V2 = 'K8sCanaryDelete',
  K8S_ROLLING_V2 = 'K8sRollingDeploy',
  K8S_ROLLBACK_ROLLING_V2 = 'K8sRollingRollback',
  K8S_APPLY_V2 = 'K8sApply',
  K8S_SCALE_V2 = 'K8sScale',
  K8S_DELETE_V2 = 'K8sDelete',
  K8S_BLUE_GREEN_STAGE_SCALE_DOWN_V2 = 'K8sBlueGreenStageScaleDown',
  K8S_DRY_RUN_V2 = 'K8sDryRun',
  HELM_DEPLOY_V2 = 'HelmDeploy',
  HELM_ROLLBACK_V2 = 'HelmRollback',
  TerraformRollback = 'TerraformRollback',
  TerraformDestroy = 'TerraformDestroy',
  TerraformPlan = 'TerraformPlan',
  TerraformApply = 'TerraformApply',
  TerragruntRollback = 'TerragruntRollback',
  TerragruntDestroy = 'TerragruntDestroy',
  TerragruntPlan = 'TerragruntPlan',
  TerragruntApply = 'TerragruntApply',
  InfraProvisioning = 'InfraProvisioning',
  KubernetesGcp = 'KubernetesGcp',
  ResourceConstraint = 'ResourceConstraint',
  FlagConfiguration = 'FlagConfiguration',
  Template = 'Template',
  Policy = 'Policy',
  ZeroNorth = 'Security',
  KubernetesAzure = 'KubernetesAzure',
  SshWinRmAzure = 'SshWinRmAzure',
  AzureWebApp = 'AzureWebApp',
  AzureWebAppServiceSpec = 'AzureWebAppServiceSpec',
  ServerlessAwsLambdaDeploy = 'ServerlessAwsLambdaDeploy',
  ServerlessAwsLambdaRollback = 'ServerlessAwsLambdaRollback',
  ServerlessAwsLambdaInfra = 'ServerlessAwsLambdaInfra',
  CloudFormationRollbackStack = 'RollbackStack',
  CloudFormationDeleteStack = 'DeleteStack',
  CloudFormationCreateStack = 'CreateStack',
  SshServiceSpec = 'SshServiceSpec',
  WinRmServiceSpec = 'WinRmServiceSpec',
  MergePR = 'MergePR',
  UpdateGitOpsApp = 'UpdateGitOpsApp',
  AzureWebAppsRollback = 'AzureWebAppRollback',
  AzureSlotDeployment = 'AzureSlotDeployment',
  JenkinsBuild = 'JenkinsBuild',
  JenkinsBuildV2 = 'JenkinsBuildV2',
  BambooBuild = 'BambooBuild',
  AzureTrafficShift = 'AzureTrafficShift',
  AzureSwapSlot = 'AzureSwapSlot',
  EcsInfra = 'EcsInfra',
  EcsService = 'EcsService',
  EcsRollingDeploy = 'EcsRollingDeploy',
  EcsRollingRollback = 'EcsRollingRollback',
  EcsCanaryDeploy = 'EcsCanaryDeploy',
  EcsCanaryDelete = 'EcsCanaryDelete',
  EcsServiceSetup = 'EcsServiceSetup',
  EcsUpgradeContainer = 'EcsUpgradeContainer',
  EcsBasicRollback = 'EcsBasicRollback',
  AzureArmRollback = 'AzureARMRollback',
  Background = 'Background',
  AzureBlueprint = 'AzureCreateBPResource',
  EcsRunTask = 'EcsRunTask',
  EcsBlueGreenCreateService = 'EcsBlueGreenCreateService',
  EcsBlueGreenSwapTargetGroups = 'EcsBlueGreenSwapTargetGroups',
  EcsBlueGreenRollback = 'EcsBlueGreenRollback',
  CreateAzureARMResource = 'AzureCreateARMResource',
  CustomDeploymentServiceSpec = 'CustomDeploymentServiceSpec',
  CustomDeployment = 'CustomDeployment',
  FetchInstanceScript = 'FetchInstanceScript',
  Wait = 'Wait',
  ShellScriptProvision = 'ShellScriptProvision',
  ChaosExperiment = 'Chaos',
  Elastigroup = 'Elastigroup',
  ElastigroupService = 'ElastigroupService',
  ElastigroupRollback = 'ElastigroupRollback',
  ElastigroupSetup = 'ElastigroupSetup',
  TasService = 'TasService',
  TasInfra = 'TAS',
  AppRollback = 'AppRollback',
  SwapRoutes = 'SwapRoutes',
  SwapRollback = 'SwapRollback',
  TanzuCommand = 'TanzuCommand',
  BasicAppSetup = 'BasicAppSetup',
  BGAppSetup = 'BGAppSetup',
  CanaryAppSetup = 'CanaryAppSetup',
  AppResize = 'AppResize',
  TasRollingDeploy = 'TasRollingDeploy',
  TasRollingRollback = 'TasRollingRollback',
  RouteMapping = 'RouteMapping',
  Asg = 'ASGServiceSpec',
  AsgInfraSpec = 'AsgInfraSpec',
  Aquatrivy = 'AquaTrivy',
  Bandit = 'Bandit',
  BlackDuck = 'BlackDuck',
  Burp = 'Burp',
  Snyk = 'Snyk',
  Sysdig = 'Sysdig',
  Grype = 'Grype',
  Gitleaks = 'Gitleaks',
  Sonarqube = 'Sonarqube',
  Zap = 'Zap',
  CodeQL = 'CodeQL',
  AsgCanaryDelete = 'AsgCanaryDelete',
  ElastigroupDeploy = 'ElastigroupDeploy',
  ElastigroupSwapRoute = 'ElastigroupSwapRoute',
  ElastigroupBGStageSetup = 'ElastigroupBGStageSetup',
  AsgCanaryDeploy = 'AsgCanaryDeploy',
  AsgRollingRollback = 'AsgRollingRollback',
  AsgRollingDeploy = 'AsgRollingDeploy',
  AsgShiftTraffic = 'AsgShiftTraffic',
  PrismaCloud = 'PrismaCloud',
  GoogleCloudFunctionsService = 'GoogleCloudFunctionsService',
  GoogleCloudFunctionsInfra = 'GoogleCloudFunctionsInfra',
  DeployCloudFunction = 'DeployCloudFunction',
  DeployCloudFunctionGenOne = 'DeployCloudFunctionGenOne',
  CloudFunctionRollback = 'CloudFunctionRollback',
  RollbackCloudFunctionGenOne = 'RollbackCloudFunctionGenOne',
  DeployCloudFunctionWithNoTraffic = 'DeployCloudFunctionWithNoTraffic',
  CloudFunctionTrafficShift = 'CloudFunctionTrafficShift',
  Checkmarx = 'Checkmarx',
  Mend = 'Mend',
  AsgBlueGreenRollback = 'AsgBlueGreenRollback',
  AsgBlueGreenSwapService = 'AsgBlueGreenSwapService',
  AsgBlueGreenDeploy = 'AsgBlueGreenDeploy',
  AwsLambdaService = 'AwsLambdaService',
  AwsLambdaInfra = 'AwsLambdaInfra',
  AwsLambdaDeploy = 'AwsLambdaDeploy',
  AwsLambdaRollback = 'AwsLambdaRollback',
  TerraformCloudRun = 'TerraformCloudRun',
  TerraformCloudRollback = 'TerraformCloudRollback',
  SscaOrchestration = 'SscaOrchestration',
  CdSscaOrchestration = 'CdSscaOrchestration',
  SscaEnforcement = 'SscaEnforcement',
  CdSscaEnforcement = 'CdSscaEnforcement',
  SlsaVerification = 'SlsaVerification',
  CustomIngest = 'CustomIngest',
  AWSSecurityHub = 'AWSSecurityHub',
  AWSECR = 'AWSECR',
  Nikto = 'Nikto',
  Nmap = 'Nmap',
  Owasp = 'Owasp',
  Prowler = 'Prowler',
  Sniper = 'Sniper',
  Metasploit = 'Metasploit',
  Brakeman = 'Brakeman',
  AwsSamDeploy = 'AwsSamDeploy',
  AwsSamBuild = 'AwsSamBuild',
  Fossa = 'Fossa',
  Semgrep = 'Semgrep',
  KubernetesAws = 'KubernetesAws',
  AwsSamService = 'AwsSamService',
  AwsSamInfra = 'AwsSamInfra',
  DownloadManifests = 'DownloadManifests',
  DownloadServerlessManifests = 'DownloadServerlessManifests',
  ServerlessAwsLambdaRollbackV2 = 'ServerlessAwsLambdaRollbackV2',
  Rancher = 'Rancher',
  KubernetesRancher = 'KubernetesRancher',
  ServerlessAwsLambdaPrepareRollbackV2 = 'ServerlessAwsLambdaPrepareRollbackV2',
  ServerlessAwsLambdaPackageV2 = 'ServerlessAwsLambdaPackageV2',
  ServerlessAwsLambdaDeployV2 = 'ServerlessAwsLambdaDeployV2',
  Coverity = 'Coverity',
  IACMTerraformPlugin = 'IACMTerraformPlugin',
  IACMApproval = 'IACMApproval',
  AwsCdkDiff = 'AwsCdkDiff',
  AwsCdkSynth = 'AwsCdkSynth',
  AwsCdkBootstrap = 'AwsCdkBootstrap',
  AwsCdkDeploy = 'AwsCdkDeploy',
  AwsCdkDestroy = 'AwsCdkDestroy',
  AwsCdkRollback = 'AwsCdkRollback',
  Provenance = 'provenance',
  CUSTOM_STAGE_ENVIRONMENT = 'CUSTOM_STAGE_ENVIRONMENT',
  Anchore = 'Anchore',
  AquaSecurity = 'AquaSecurity',
  Cookiecutter = 'CookieCutter',
  CreateRepo = 'CreateRepo',
  DirectPush = 'DirectPush',
  RegisterCatalog = 'RegisterCatalog',
  CreateCatalog = 'CreateCatalog',
  SlackNotify = 'SlackNotify',
  // yaml-simplification v1 step types
  'shell-script' = 'ShellScript',
  http = 'Http'
}

export interface PipelineInfrastructureV2 extends PipelineInfrastructure {
  environmentOrEnvGroupRef?: SelectOption
  environmentGroup?: any
  environmentRef2?: SelectOption
  infrastructureRef?: SelectOption
}

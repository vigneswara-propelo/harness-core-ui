export const getGCRArtifactData = (): {
  identifier: string
  connectorId: string
  registryHostname: string
  imagePath: string
  yaml: string
} => {
  const identifier = 'GCRTrigger'
  const connectorId = 'testAWS'
  const registryHostname = 'gcr.io'
  const imagePath = 'test-image-path'
  const yaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Gcr\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ${imagePath}\n        registryHostname: ${registryHostname}\n        tag: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, connectorId, registryHostname, imagePath, yaml }
}

export const getGoogleCloudStorageArtifactData = (): {
  identifier: string
  connectorId: string
  project: string
  bucket: string
  yaml: string
} => {
  const identifier = 'GCRTrigger'
  const connectorId = 'testAWS'
  const project = 'onprem-play'
  const bucket = 'qa-charts'
  const yaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: GoogleCloudStorage\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        project: ${project}\n        bucket: ${bucket}\n        artifactPath: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, connectorId, project, bucket, yaml }
}

export const getBambooArtifactData = (): {
  identifier: string
  connectorId: string
  planKey: string
  artifactPaths: string[]
  yaml: string
} => {
  const identifier = 'BambooTrigger'
  const connectorId = 'testAWS'
  const planKey = 'PFP-PT'
  const artifactPaths = ['store/helloworld.war']
  const yaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Bamboo\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        planKey: ${planKey}\n        artifactPaths:\n          - store/helloworld.war\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, connectorId, planKey, artifactPaths, yaml }
}

export const getACRArtifactData = (): {
  identifier: string
  connectorId: string
  subscriptionId: string
  registry: string
  repository: string
  yaml: string
} => {
  const identifier = 'ACRTrigger'
  const connectorId = 'testAWS'
  const subscriptionId = '12d2db62-5aa9-471d-84bb-faa489b3e319'
  const registry = 'automationci'
  const repository = 'automation'
  const yaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Acr\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        registry: ${registry}\n        repository: automation\n        subscriptionId: ${subscriptionId}\n        tag: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, connectorId, subscriptionId, registry, repository, yaml }
}

export const getDockerRegistryArtifactData = (): {
  identifier: string
  connectorId: string
  imagePath: string
  yaml: string
} => {
  const identifier = 'DockerRegistryTrigger'
  const connectorId = 'testAWS'
  const imagePath = '/test-image-path'
  const yaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: DockerRegistry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ${imagePath}\n        tag: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, connectorId, imagePath, yaml }
}

export const getECRArtifactData = (): {
  identifier: string
  connectorId: string
  regionLabel: string
  imagePath: string
  yaml: string
} => {
  const identifier = 'ECRTrigger'
  const connectorId = 'testAWS'
  const region = 'us-east-1'
  const regionLabel = 'US East (N. Virginia)'
  const imagePath = 'todolist'
  const yaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Ecr\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ${imagePath}\n        region: ${region}\n        tag: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, connectorId, regionLabel, imagePath, yaml }
}

export const getAmazonS3ArtifactData = (): {
  identifier: string
  connectorId: string
  region: string
  bucketName: string
  filePathRegex: string
  yaml: string
} => {
  const identifier = 'AmazonS3Trigger'
  const connectorId = 'testAWS'
  const region = 'us-east-1'
  const bucketName = 'may12020'
  const filePathRegex = '/*'
  const yaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AmazonS3\n      spec:\n        bucketName: ${bucketName}\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        filePathRegex: /*\n        region: ${region}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, connectorId, region, bucketName, filePathRegex, yaml }
}

export const getGithubPackageRegistryArtifactData = (): {
  identifier: string
  connectorId: string
  org: string
  packageName: string
  yaml: string
} => {
  const identifier = 'GithubPackageRegistryTrigger'
  const connectorId = 'testAWS'
  const org = 'test-org'
  const packageName = 'nginx'
  const yaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: GithubPackageRegistry\n      spec:\n        packageName: ${packageName}\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        packageType: container\n        org: ${org}\n        version: <+trigger.artifact.build>\n        versionRegex: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, connectorId, org, packageName, yaml }
}

export const getGoogleArtifactRegistryTriggerArtifactData = (): {
  identifier: string
  connectorId: string
  project: string
  region: string
  repositoryName: string
  pkg: string
  yaml: string
} => {
  const identifier = 'GoogleArtifactRegistryTrigger'
  const connectorId = 'testAWS'
  const project = 'test-project'
  const region = 'asia'
  const repositoryName = 'demo'
  const pkg = 'test-package'
  const yaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: GoogleArtifactRegistry\n      spec:\n        package: ${pkg}\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        project: ${project}\n        region: ${region}\n        repositoryName: ${repositoryName}\n        version: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, connectorId, project, region, repositoryName, pkg, yaml }
}

export const getCustomArtifactData = (): {
  identifier: string
  script: string
  artifactsArrayPath: string
  versionPath: string
  scriptInputVariables: { name: string; type: 'String' | 'Number'; value: string }[]
  yaml: string
} => {
  const identifier = 'CustomTrigger'
  const script = 'echo "Hello World"'
  const artifactsArrayPath = 'test-artifacts-Array-Path'
  const versionPath = 'test-version-Path'
  const scriptInputVariables: { name: string; type: 'String' | 'Number'; value: string }[] = [
    { name: 'Var_A', type: 'String', value: 'A' },
    { name: 'Var_b', type: 'Number', value: '1' }
  ]
  const yaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: CustomArtifact\n      spec:\n        artifactsArrayPath: test-artifacts-Array-Path\n        inputs:\n          - name: Var_A\n            type: String\n            value: A\n          - name: Var_b\n            type: Number\n            value: "1"\n        script: echo "Hello World"\n        version: <+trigger.artifact.build>\n        versionPath: test-version-Path\n        connectorRef: ""\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, script, artifactsArrayPath, versionPath, scriptInputVariables, yaml }
}

export const getArtifactoryArtifactData = (): {
  identifier: string
  connectorId: string
  repository: string
  generic: {
    repositoryFormat: string
    artifactDirectory: string
    yaml: string
  }
  docker: {
    repositoryFormat: string
    artifactPath: string
    repositoryUrl: string
    yaml: string
  }
} => {
  const identifier = 'ArtifactoryTrigger'
  const connectorId = 'testAWS'
  const repository = 'lambda'

  const artifactDirectory = '/test-artifact-directory'
  const genericYaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: ArtifactoryRegistry\n      spec:\n        repositoryFormat: generic\n        repository: ${repository}\n        artifactDirectory: /test-artifact-directory\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  const artifactPath = 'alpine'
  const repositoryUrl = 'www.test-repository-url.com'
  const dockerYaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: ArtifactoryRegistry\n      spec:\n        repositoryFormat: docker\n        repository: ${repository}\n        artifactPath: ${artifactPath}\n        repositoryUrl: ${repositoryUrl}\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return {
    identifier,
    connectorId,
    repository,
    generic: { repositoryFormat: 'Generic', artifactDirectory, yaml: genericYaml },
    docker: { repositoryFormat: 'Docker', artifactPath, repositoryUrl, yaml: dockerYaml }
  }
}

export const getAzureArtifactData = (): {
  identifier: string
  connectorId: string
  feed: string
  pkg: string
  projectScope: {
    scope: string
    project: string
    maven: {
      yaml: string
    }
    nuget: {
      yaml: string
    }
  }
  orgScope: {
    scope: string
    maven: {
      yaml: string
    }
    nuget: {
      yaml: string
    }
  }
} => {
  const identifier = 'AzureTrigger'
  const connectorId = 'testAWS'
  const feed = 'feedproject'
  const pkg = 'com.bugsnag:bugsnag'
  const project = 'automation-cdc'

  return {
    identifier,
    connectorId,
    feed,
    pkg,
    projectScope: {
      scope: 'Project',
      project,
      maven: {
        yaml: `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AzureArtifacts\n      spec:\n        connectorRef: ${connectorId}\n        scope: project\n        feed: ${feed}\n        packageType: maven\n        package: ${pkg}\n        project: ${project}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
      },
      nuget: {
        yaml: `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AzureArtifacts\n      spec:\n        connectorRef: ${connectorId}\n        scope: project\n        feed: ${feed}\n        packageType: nuget\n        package: ${pkg}\n        project: ${project}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
      }
    },
    orgScope: {
      scope: 'Org',
      maven: {
        yaml: `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AzureArtifacts\n      spec:\n        connectorRef: ${connectorId}\n        scope: org\n        feed: ${feed}\n        packageType: maven\n        package: ${pkg}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
      },
      nuget: {
        yaml: `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AzureArtifacts\n      spec:\n        connectorRef: ${connectorId}\n        scope: org\n        feed: ${feed}\n        packageType: nuget\n        package: ${pkg}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
      }
    }
  }
}

export const getAmazonMachineImageArtifactData = (): {
  identifier: string
  connectorId: string
  region: string
  regionLabel: string
  tags: { name: string; value: string }[]
  filter: { name: string; value: string }[]
  yaml: string
} => {
  const identifier = 'AmazonMachineImageTrigger'
  const connectorId = 'testAWS'
  const region = 'us-east-1'
  const regionLabel = 'US East (N. Virginia)'
  const tags = [
    { name: 'owner', value: '1' },
    { name: 'purpose', value: '2' }
  ]
  const filter = [
    {
      name: 'ami-image-id',
      value: '1'
    },
    { name: 'ami-name', value: '2' }
  ]
  const yaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AmazonMachineImage\n      spec:\n        connectorRef: testAWS\n        region: us-east-1\n        tags:\n          - name: owner\n            value: "1"\n          - name: purpose\n            value: "2"\n        filters:\n          - name: ami-image-id\n            value: "1"\n          - name: ami-name\n            value: "2"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, connectorId, region, regionLabel, tags, filter, yaml }
}

export const getJenkinsArtifactData = (): {
  identifier: string
  connectorId: string
  jobName: string
  parentJobName: string
  childJobName: string
  artifactPath: string
  parentJobYaml: string
  childJobYaml: string
} => {
  const identifier = 'JenkinsTrigger'
  const connectorId = 'testAWS'
  const jobName = 'AutomationQA'
  const parentJobName = 'CDTest'
  const childJobName = 'CDTest/folder1/Redis_Job'
  const artifactPath = 'function.tar.gz'
  const parentJobYaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Jenkins\n      spec:\n        connectorRef: testAWS\n        artifactPath: ${artifactPath}\n        jobName: ${jobName}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
  const childJobYaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Jenkins\n      spec:\n        connectorRef: testAWS\n        artifactPath: ${artifactPath}\n        jobName: ${childJobName}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, connectorId, jobName, parentJobName, childJobName, artifactPath, parentJobYaml, childJobYaml }
}

export const getNexus3ArtifactData = (): {
  identifier: string
  connectorId: string
  dockerRepositoryFormat: {
    repositoryFormat: string
    repository: string
    artifactPath: string
    repositoryUrl: string
    repositoryPort: string
    repositoryUrlYaml: string
    repositoryPortYaml: string
  }
  mavenRepositoryFormat: {
    repositoryFormat: string
    repository: string
    groupId: string
    artifactId: string
    extension: string
    classifier: string
    yaml: string
  }
  npmRepositoryFormat: {
    repositoryFormat: string
    repository: string
    packageName: string
    yaml: string
  }
  nugetRepositoryFormat: {
    repositoryFormat: string
    repository: string
    packageName: string
    yaml: string
  }
  rawRepositoryFormat: {
    repositoryFormat: string
    repository: string
    group: string
    yaml: string
  }
} => {
  const identifier = 'Nexus3Trigger'
  const connectorId = 'testAWS'
  const repository = 'todolist'
  const artifactPath = '/test-artifact-path'
  const repositoryUrl = 'www.test-repository-url.com'
  const repositoryPort = '8080'
  const groupId = 'selenium'
  const artifactId = 'test-id-2'
  const extension = 'test-extension'
  const classifier = 'test-classifier'
  const packageName = 'test-package-name'
  const group = 'test-group'

  return {
    identifier,
    connectorId,
    dockerRepositoryFormat: {
      repositoryFormat: 'Docker',
      repository,
      artifactPath,
      repositoryUrl,
      repositoryPort,
      repositoryUrlYaml: `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        repositoryFormat: docker\n        repository: ${repository}\n        repositoryPortorRepositoryURL: repositoryUrl\n        tag: <+trigger.artifact.build>\n        artifactPath: /test-artifact-path\n        repositoryUrl: ${repositoryUrl}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`,
      repositoryPortYaml: `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        repositoryFormat: docker\n        repository: ${repository}\n        repositoryPortorRepositoryURL: repositoryPort\n        tag: <+trigger.artifact.build>\n        artifactPath: /test-artifact-path\n        repositoryPort: "8080"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
    },
    mavenRepositoryFormat: {
      repositoryFormat: 'Maven',
      repository,
      groupId,
      artifactId,
      extension,
      classifier,
      yaml: `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        repositoryFormat: maven\n        repository: ${repository}\n        tag: <+trigger.artifact.build>\n        groupId: ${groupId}\n        artifactId: ${artifactId}\n        extension: ${extension}\n        classifier: ${classifier}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
    },
    npmRepositoryFormat: {
      repositoryFormat: 'NPM',
      repository,
      packageName,
      yaml: `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        repositoryFormat: npm\n        repository: ${repository}\n        tag: <+trigger.artifact.build>\n        packageName: ${packageName}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
    },
    nugetRepositoryFormat: {
      repositoryFormat: 'NuGet',
      repository,
      packageName,
      yaml: `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        repositoryFormat: nuget\n        repository: ${repository}\n        tag: <+trigger.artifact.build>\n        packageName: ${packageName}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
    },
    rawRepositoryFormat: {
      repositoryFormat: 'Raw',
      repository,
      group,
      yaml: `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        repositoryFormat: raw\n        repository: ${repository}\n        tag: <+trigger.artifact.build>\n        group: ${group}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
    }
  }
}

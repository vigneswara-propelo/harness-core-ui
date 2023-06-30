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
  const repositoryName = 'test-repository-name'
  const pkg = 'test-package'
  const yaml = `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: GoogleArtifactRegistry\n      spec:\n        package: ${pkg}\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        project: ${project}\n        region: ${region}\n        repositoryName: ${repositoryName}\n        version: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`

  return { identifier, connectorId, project, region, repositoryName, pkg, yaml }
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

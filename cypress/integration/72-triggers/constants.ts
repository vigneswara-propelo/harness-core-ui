/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { accountId, orgIdentifier, pipelineIdentifier, projectId } from '../../support/70-pipeline/constants'

export const createTriggerAPI = `/pipeline/api/triggers?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&targetIdentifier=${pipelineIdentifier}`
export const createTriggerAPIV2 = `/pipeline/api/triggers?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&targetIdentifier=${pipelineIdentifier}&ignoreError=false&withServiceV2=true`
export const getTriggerListAPI = `/pipeline/api/triggers?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&targetIdentifier=${pipelineIdentifier}&size=20&page=0&sort=createdAt%2CDESC`
export const getTriggerCatalogAPI = `/pipeline/api/triggers/catalog?routingId=${accountId}&accountIdentifier=${accountId}`
export const getTriggerAPI = (triggerIdentifier: string): string => `/pipeline/api/triggers/${triggerIdentifier}*`
export const mergeInputSets = 'pipeline/api/inputSets/merge*'
export const updateTriggerAPI = (triggerIdentifier: string): string => `/pipeline/api/triggers/${triggerIdentifier}*`
export const getAWSRegions = `api/awshelper/aws-regions?routingId=${accountId}&accountId=${accountId}`
export const getGARRegions = `ng/api/artifacts/gar/getRegions?routingId=${accountId}`
export const getArtifactsECRGetImages = ({ connectorId, region }): string =>
  `ng/api/artifacts/ecr/getImages?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&connectorRef=${connectorId}&region=${region}`
export const getGARRepo = ({ connectorId, region, project }): string =>
  `ng/api/artifacts/gar/getRepositories?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&connectorRef=${connectorId}&project=${project}&region=${region}`
export const getS3BucketsV2 = ({ connectorId, region }): string =>
  `ng/api/buckets/s3/getBucketsV2?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&connectorRef=${connectorId}&region=${region}`
export const getArtifactsArtifactoryRepositoriesDetails = ({ connectorId, repositoryType }): string =>
  `ng/api/artifacts/artifactory/repositoriesDetails?routingId=${accountId}&connectorRef=${connectorId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&repositoryType=${repositoryType}`
export const getArtifactsArtifactoryImagePaths = ({ connectorId, repository }): string =>
  `ng/api/artifacts/artifactory/imagePaths?routingId=${accountId}&repository=${repository}&connectorRef=${connectorId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`
export const getAzureSubscriptions = ({ connectorId }): string =>
  `ng/api/azure/subscriptions?routingId=${accountId}&connectorRef=${connectorId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`
export const getArtifactsACRContainerRegistries = ({ connectorId, subscriptionId }): string =>
  `ng/api/artifacts/acr/container-registries?routingId=${accountId}&connectorRef=${connectorId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&subscriptionId=${subscriptionId}`
export const getArtifactsACRContainerRegistryRepositories = ({ registry, connectorId, subscriptionId }): string =>
  `ng/api/artifacts/acr/container-registries/${registry}/repositories?routingId=${accountId}&connectorRef=${connectorId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&subscriptionId=${subscriptionId}`
export const getArtifactsGithubPackages = ({ connectorId, org }): string =>
  `ng/api/artifacts/githubpackages/packages?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&connectorRef=${connectorId}&packageType=container&org=${org}`
export const getArtifactsJenkinsJobs = ({ connectorId }): string =>
  `ng/api/artifacts/jenkins/jobs?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&connectorRef=${connectorId}`
export const getArtifactsJenkinsChildJobs = ({ connectorId, parentJobName }): string =>
  `ng/api/artifacts/jenkins/jobs?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&connectorRef=${connectorId}&parentJobName=${parentJobName}`
export const getArtifactsJenkinsJobPaths = ({ connectorId, job }): string =>
  `ng/api/artifacts/jenkins/job/${encodeURIComponent(
    job
  )}/paths?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&connectorRef=${connectorId}`
export const getAzureArtifactsProjects = ({ connectorId }): string =>
  `ng/api/artifacts/azureartifacts/projects?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&connectorRef=${connectorId}`
export const getAzureArtifactsFeeds = ({ connectorId, project }): string =>
  `ng/api/artifacts/azureartifacts/feeds?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&connectorRef=${connectorId}&project=${project}`
export const getAzureArtifactsPackages = ({ connectorId, packageType, feed, project }): string =>
  `ng/api/artifacts/azureartifacts/packages?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&connectorRef=${connectorId}&project=${project}&packageType=${packageType}&feed=${feed}`
export const getNexusRepositories = ({ connectorId, repositoryFormat }): string =>
  `ng/api/artifacts/nexus/getRepositories?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&connectorRef=${connectorId}&repositoryFormat=${repositoryFormat}`
export const getNexusGroupIds = ({ connectorId, repositoryFormat, repository }): string =>
  `ng/api/artifacts/nexus/groupIds?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&connectorRef=${connectorId}&repository=${repository}&repositoryFormat=${repositoryFormat}`
export const getNexusArtifactIds = ({ connectorId, repositoryFormat, repository }): string =>
  `ng/api/artifacts/nexus/artifactIds?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&connectorRef=${connectorId}&repository=${repository}&repositoryFormat=${repositoryFormat}&nexusSourceType=Nexus3Registry`
export const getArtifactsAMITags = ({ connectorId, region }): string =>
  `ng/api/artifacts/ami/tags?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&region=${region}&connectorRef=${connectorId}`
export const getGCPProjects = ({ connectorId }): string =>
  `ng/api/gcp/project?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&connectorRef=${connectorId}`
export const getGCPbuckets = ({ connectorId, project }): string =>
  `ng/api/artifacts/google-cloud-storage/buckets?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&connectorRef=${connectorId}&project=${project}`
export const getBambooPlans = ({ connectorId }): string =>
  `ng/api/artifacts/bamboo/plans?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&connectorRef=${connectorId}`
export const getBambooPaths = ({ connectorId, planKey }): string =>
  `ng/api/artifacts/bamboo/paths?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&connectorRef=${connectorId}&planName=${planKey}`
export const awsConnectorCall = `ng/api/connectors/testAWS?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`

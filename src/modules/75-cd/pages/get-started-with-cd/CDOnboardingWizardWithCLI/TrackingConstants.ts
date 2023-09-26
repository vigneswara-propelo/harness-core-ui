export enum WIZARD_STEP_OPEN {
  WHAT_STEP_OPENED = 'CD Onboarding What Step Opened',
  HOW_N_WHERE_STEP_OPENED = 'CD Onboarding How And Where Step Opened',
  CREATE_DELEGATE_FLYOUT_OPENED = 'CD Onboarding Create Delegate Flyout Opened',
  Configuration_STEP_OPENED = 'CD Onboarding Configuration Step Opened',
  CREATE_AGENT_FLYOUT_OPENED = 'CD Onboarding Create GitOps Agent Interface Opened'
}

export enum ONBOARDING_INTERACTIONS {
  DELEGATE_VERIFICATION_START = 'CD Onboarding Delegate Verification Started ',
  DELEGATE_VERIFICATION_SUCCESS = 'CD Onboarding Delegate Verification Succeded',
  DELEGATE_VERIFICATION_FAIL = 'CD Onboarding Delegate Verification Failed',
  CONFIG_VERIFICATION_START = 'CD Onboarding Config Verification Started ',
  CONFIG_VERIFICATION_SUCCESS = 'CD Onboarding Config Verification Succeded',
  CONFIG_VERIFICATION_FAIL = 'CD Onboarding Config Verification Failed',
  CD_ONBOARDING_BRANCH_SELECTED = 'CD Onboarding Branch Selected',
  AGENT_VERIFICATION_START = 'CD Onboarding Agent Verification Started ',
  AGENT_VERIFICATION_SUCCESS = 'CD Onboarding Agent Verification Succeded',
  AGENT_VERIFICATION_FAIL = 'CD Onboarding Agent Verification Failed',
  REPO_VERIFICATION_START = 'CD Onboarding Config Repository Verification Started ',
  REPO_VERIFICATION_SUCCESS = 'CD Onboarding Config Repository Verification Succeded',
  REPO_VERIFICATION_FAIL = 'CD Onboarding Config Repository Verification Failed',
  APP_VERIFICATION_START = 'CD Onboarding Config Application Verification Started ',
  APP_VERIFICATION_SUCCESS = 'CD Onboarding Config Application Verification Succeded',
  APP_VERIFICATION_FAIL = 'CD Onboarding Config Application Verification Failed',
  CLUSTER_VERIFICATION_START = 'CD Onboarding Config Cluster Verification Started ',
  CLUSTER_VERIFICATION_SUCCESS = 'CD Onboarding Config Cluster Verification Succeded',
  CLUSTER_VERIFICATION_FAIL = 'CD Onboarding Config Cluster Verification Failed'
}

export enum BRANCH_LEVEL {
  BRANCH_LEVEL_1 = 'branch_level_1',
  BRANCH_LEVEL_2 = 'branch_level_2',
  BRANCH_LEVEL_3 = 'branch_level_3'
}

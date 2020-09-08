export default {
  NAME: 'VERIFY CONNECTION',
  HEADING: 'Verify Connection to ',
  STEPS: {
    ONE: 'Checking for delegates ',
    TWO: (connector: string) => `Establishing Connection between Delegate and ${connector || 'Connector'}`,
    THREE: 'Verifying Connection'
  },
  FINISH: 'FINISH',
  EDIT_CREDS: 'Edit Credentials',
  RETEST: 'RETEST CONNECTION',
  LAST_CONNECTED: 'Last connected successfully',
  delegateFound: (count: number | undefined) => `${count ? count : 'No'} delegate found`,
  STEP_TWO_POPOVER: 'Establishing connection',
  CONTINUE: 'CONTINUE'
}

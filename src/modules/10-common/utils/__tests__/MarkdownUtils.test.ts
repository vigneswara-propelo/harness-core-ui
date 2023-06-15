/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getHTMLFromMarkdown } from '../MarkdownUtils'

describe('Test MarkdownUtils', () => {
  test('render getHTMLFromMarkdown method', () => {
    const markdown =
      '## Error message\n```\nCannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?\n```\n\n## Root cause\nThe Docker daemon is not running on the machine.\n\n## Remediation\nStart the Docker daemon on the machine. This can be done by running the following command:\n```\nsudo service docker start\n```\nIf the issue persists, check if the Docker daemon is installed and properly configured on the machine.'
    expect(getHTMLFromMarkdown(markdown)).toMatchInlineSnapshot(`
      "<h2 id=\\"error-message\\">Error message</h2>
      <pre><code>Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
      </code></pre>
      <h2 id=\\"root-cause\\">Root cause</h2>
      <p>The Docker daemon is not running on the machine.</p>
      <h2 id=\\"remediation\\">Remediation</h2>
      <p>Start the Docker daemon on the machine. This can be done by running the following command:</p>
      <pre><code>sudo service docker start
      </code></pre>
      <p>If the issue persists, check if the Docker daemon is installed and properly configured on the machine.</p>
      "
    `)
  })
})

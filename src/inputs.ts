import { getInput } from '@actions/core';

export interface Inputs {
  githubToken: string;
  datadogApiKey: string;
  enableWorkflowMetrics: boolean;
  enableBillingMetrics: boolean;
}

export const getInputs = (): Inputs => {
  const githubToken = getInput('github-token');
  const datadogApiKey = getInput('datadog-api-key', { required: true });
  const enableWorkflowMetrics =
    getInput('enable-workflow-metrics', { required: true }) === 'true';
  const enableOwnerMetrics =
    getInput('enable-billing-metrics', { required: true }) === 'true';

  return {
    githubToken,
    datadogApiKey,
    enableWorkflowMetrics,
    enableBillingMetrics: enableOwnerMetrics,
  };
};

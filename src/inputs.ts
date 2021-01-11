import { getInput } from '@actions/core';

export interface Inputs {
  datadogApiKey: string;
}

export const getInputs = (): Inputs => {
  const datadogApiKey = getInput('datadog-api-key', { required: true });

  return {
    datadogApiKey,
  };
};

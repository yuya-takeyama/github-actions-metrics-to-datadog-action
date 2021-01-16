import { getInputs } from './inputs';
import { sendMetrics } from './sendMetrics';
import core from '@actions/core';

(async () => {
  try {
    await sendMetrics(getInputs());
  } catch (err) {
    core.setFailed(err);
  }
})();

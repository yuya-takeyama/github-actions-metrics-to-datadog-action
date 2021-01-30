import { getInputs } from './inputs';
import { sendMetrics } from './sendMetrics';
import { setFailed } from '@actions/core';

(async () => {
  try {
    await sendMetrics(getInputs());
  } catch (err) {
    setFailed(err);
  }
})();

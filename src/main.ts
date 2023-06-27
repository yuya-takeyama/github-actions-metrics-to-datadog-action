import { getInputs } from './inputs';
import { sendMetrics } from './sendMetrics';
import { setFailed } from '@actions/core';

(async () => {
  try {
    await sendMetrics(getInputs());
  } catch (err) {
    const message =
      err instanceof Error && err.message ? err.message : 'Unknown error';
    setFailed(message);
  }
})();

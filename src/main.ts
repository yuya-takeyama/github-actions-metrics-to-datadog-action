import { getInputs } from './inputs';
import { sendMetrics } from './sendMetrics';
import { setFailed } from '@actions/core';

(async () => {
  try {
    await sendMetrics(getInputs());
  } catch (err) {
    const message =
      err instanceof Error && err.message ? err.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error(err);
    setFailed(message);
  }
})();

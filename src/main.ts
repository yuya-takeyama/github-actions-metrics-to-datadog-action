import { getInputs } from './inputs';
import { sendMetrics } from './sendMetrics';

(async () => {
  await sendMetrics(getInputs());
})();

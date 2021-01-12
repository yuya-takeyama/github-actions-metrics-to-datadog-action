import type { Inputs } from './inputs';
import { context } from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { Metrics, MetricPoint, postMetrics } from './datadog';
import {
  getWorkflowDuration,
  parseWorkflowRun,
  WorkflowRun,
  WorkflowRunPayload,
} from './github';

export const sendMetrics = async (inputs: Inputs): Promise<void> => {
  const workflowRun = parseWorkflowRun(
    context.payload.workflow_run as WorkflowRunPayload,
  );
  const duration = getWorkflowDuration(workflowRun);
  const point: MetricPoint = [workflowRun.createdAt.getTime() / 1000, duration];
  const tags = getTags(context, workflowRun);
  const metricName = 'github.actions.workflow_duration';
  const metrics: Metrics = {
    series: [
      {
        host: 'github.com',
        metric: metricName,
        points: [point],
        tags,
      },
    ],
  };

  await postMetrics(inputs.datadogApiKey, metrics);
};

export const getTags = (
  githubContext: Context,
  workflowRun: WorkflowRun,
): string[] => {
  return [
    `repository_owner:${githubContext.payload.repository?.owner.login}`,
    `repository_name:${githubContext.payload.repository?.name}`,
    `workflow_name:${workflowRun.name}`,
    `event:${workflowRun.event}`,
    `conclusion:${workflowRun.conclusion}`,
    `branch:${workflowRun.headBranch}`,
  ];
};

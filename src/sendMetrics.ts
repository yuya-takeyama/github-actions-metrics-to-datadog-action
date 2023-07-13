import type { Inputs } from './inputs';
import { context } from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { Octokit } from '@octokit/core';
import { retry } from '@octokit/plugin-retry';

import {
  Metric,
  Metrics,
  MetricPoint,
  PostMetricsResult,
  postMetrics,
} from './datadog';
import {
  getWorkflowDuration,
  parseWorkflowRun,
  BillingData,
  Workflow,
  WorkflowRun,
  WorkflowRunPayload,
  RepositoryWorkflowBilling,
  getActionsBillingData,
  getRepositoryWorkflowsAndBillings,
} from './github';

export const sendMetrics = async (inputs: Inputs): Promise<void> => {
  const MyOctokit = Octokit.plugin(retry);
  const octokit = new MyOctokit({ auth: inputs.githubToken });

  if (inputs.enableWorkflowMetrics && context.payload.workflow_run) {
    const workflowRun = parseWorkflowRun(
      context.payload.workflow_run as WorkflowRunPayload,
    );
    await sendWorkflowMetrics({ inputs, workflowRun });
  }
  if (inputs.enableBillingMetrics) {
    await sendOwnerMetrics({ octokit, inputs });
  }
  if (inputs.enableRepositoryWorkflowsBillingMetrics) {
    await sendRepositoryWorkflowsBillingMetrics({ octokit, inputs });
  }
};

type sendWorkflowMetricsParams = {
  inputs: Inputs;
  workflowRun: WorkflowRun;
};

const sendWorkflowMetrics = async ({
  inputs,
  workflowRun,
}: sendWorkflowMetricsParams): Promise<PostMetricsResult> => {
  const duration = getWorkflowDuration(workflowRun);
  const point: MetricPoint = [workflowRun.createdAt.getTime() / 1000, duration];
  const tags = getWorkflowTags(context, workflowRun);
  const metricName = 'github.actions.workflow_duration';
  const metrics: Metrics = {
    series: [
      {
        host: 'github.com',
        metric: metricName,
        points: [point],
        tags,
        type: 'gauge',
      },
    ],
  };

  return await postMetrics(inputs.datadogApiKey, metrics);
};

export const getWorkflowTags = (
  githubContext: Context,
  workflowRun: WorkflowRun,
): string[] => {
  return [
    `repository_owner:${githubContext.repo.owner}`,
    `repository_name:${githubContext.repo.repo}`,
    `workflow_name:${workflowRun.name}`,
    `event:${workflowRun.event}`,
    `conclusion:${workflowRun.conclusion}`,
    `branch:${workflowRun.headBranch}`,
  ];
};

type sendOwnerMetricsParams = {
  octokit: Octokit;
  inputs: Inputs;
};

const sendOwnerMetrics = async ({
  octokit,
  inputs,
}: sendOwnerMetricsParams): Promise<PostMetricsResult> => {
  const now = new Date();
  const tags = getOwnerTags(context);
  const billingData = await getActionsBillingData({ context, octokit });

  return await postMetrics(
    inputs.datadogApiKey,
    actionsBillingToMetrics({ now, tags, billingData }),
  );
};

const getOwnerTags = (githubContext: Context): string[] => {
  return [`repository_owner:${githubContext.repo.owner}`];
};

type actionsBillingToMetricsParams = {
  now: Date;
  tags: string[];
  billingData: BillingData;
};

const actionsBillingToMetrics = ({
  now,
  tags,
  billingData,
}: actionsBillingToMetricsParams): Metrics => {
  const breakdownSeries: Metric[] = Object.entries(
    billingData.minutes_used_breakdown,
  ).map(([key, usage]) => {
    return {
      host: 'github.com',
      metric: 'github.actions.billing.minutes_used_breakdown',
      points: [[now.getTime() / 1000, usage]],
      tags: [...tags, `os:${key}`],
      type: 'gauge',
    };
  });
  return {
    series: [
      {
        host: 'github.com',
        metric: 'github.actions.billing.total_minutes_used',
        points: [[now.getTime() / 1000, billingData.total_minutes_used]],
        tags,
        type: 'gauge',
      },
      {
        host: 'github.com',
        metric: 'github.actions.billing.total_paid_minutes_used',
        points: [
          [now.getTime() / 1000, Number(billingData.total_paid_minutes_used)],
        ],
        tags,
        type: 'gauge',
      },
      {
        host: 'github.com',
        metric: 'github.actions.billing.included_minutes',
        points: [[now.getTime() / 1000, billingData.included_minutes]],
        tags,
        type: 'gauge',
      },
      ...breakdownSeries,
    ],
  };
};

type sendRepositoryWorkflowsBillingMetricsParams = {
  inputs: Inputs;
  octokit: Octokit;
};

const sendRepositoryWorkflowsBillingMetrics = async ({
  inputs,
  octokit,
}: sendRepositoryWorkflowsBillingMetricsParams): Promise<PostMetricsResult> => {
  const now = new Date();
  const workflowsAndBillings = await getRepositoryWorkflowsAndBillings(
    context,
    octokit,
  );
  const tags = getRepositoryWorkflowsTags();

  return await postMetrics(
    inputs.datadogApiKey,
    repositoryWorkflowsBillingMetrics({
      workflowsAndBillings,
      now,
      tags,
    }),
  );
};

type repositoryWorkflowsBillingMetricsParams = {
  workflowsAndBillings: [Workflow, RepositoryWorkflowBilling][];
  now: Date;
  tags: string[];
};

const repositoryWorkflowsBillingMetrics = ({
  workflowsAndBillings,
  now,
  tags,
}: repositoryWorkflowsBillingMetricsParams): Metrics => {
  const nestedMetrics: Metric[][] = workflowsAndBillings.map(
    ([workflow, billing]) => {
      return Object.entries(billing).map(([key, data]) => {
        const totalMs = data?.total_ms || 0;
        return {
          host: 'github.com',
          metric: 'github.actions.billing.repository_workflow_total_ms',
          points: [[now.getTime() / 1000, totalMs]],
          tags: [...tags, `workflow_name:${workflow.name}`, `os:${key}`],
          type: 'gauge',
        };
      });
    },
  );
  const flatMetrics = nestedMetrics.reduce((acc, metrics) => {
    for (const metric of metrics) {
      acc.push(metric);
    }
    return acc;
  }, []);
  return { series: flatMetrics };
};

const getRepositoryWorkflowsTags = (): string[] => {
  return [
    `repository_owner:${context.repo.owner}`,
    `repository_name:${context.repo.repo}`,
  ];
};

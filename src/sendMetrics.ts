import type { Inputs } from './inputs';
import { context } from '@actions/github';
import fetch from 'node-fetch';

interface WorkflowRunPayload {
  id: number;
  url: string;
  run_number: number;
  workflow_id: number;
  workflow_url: string;
  name: string;
  event: string;
  status: 'queued' | 'completed';
  conclusion: 'success' | 'failure' | null;
  head_branch: string;
  created_at: string;
  updated_at: string;
}

interface WorkflowRun {
  id: number;
  url: string;
  runNumber: number;
  workflowId: number;
  workflowUrl: string;
  name: string;
  event: string;
  status: 'queued' | 'completed';
  conclusion: 'success' | 'failure' | null;
  headBranch: string;
  createdAt: Date;
  updatedAt: Date;
}

export const sendMetrics = async (inputs: Inputs): Promise<void> => {
  const workflowRun = parseWorkflowRun(
    context.payload.workflow_run as WorkflowRunPayload,
  );
  const duration = getDuration(workflowRun);
  const metricName = 'github.actions.workflow_duration';
  const body = {
    series: [
      {
        host: 'github.com',
        metric: metricName,
        points: [[workflowRun.createdAt.getTime() / 1000, duration]],
        tags: [
          `repository_owner:${context.payload.repository?.owner.login}`,
          `repository_name:${context.payload.repository?.name}`,
          `workflow_name:${workflowRun.name}`,
          `event:${workflowRun.event}`,
          `conclusion:${workflowRun.conclusion}`,
          `branch:${workflowRun.headBranch}`,
        ],
      },
    ],
  };

  const res = await fetch(
    `https://api.datadoghq.com/api/v1/series?api_key=${inputs.datadogApiKey}`,
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': inputs.datadogApiKey,
      },
      body: JSON.stringify(body),
    },
  );
  if (res.status !== 202) {
    const text = await res.text();
    console.log(text); // eslint-disable-line no-console
    throw new Error(`Error response from Datadog: ${res.status}`);
  }
};

const parseWorkflowRun = (payload: WorkflowRunPayload): WorkflowRun => {
  return {
    id: payload.id,
    url: payload.url,
    runNumber: payload.run_number,
    workflowId: payload.workflow_id,
    workflowUrl: payload.workflow_url,
    name: payload.name,
    event: payload.event,
    status: payload.status,
    conclusion: payload.conclusion,
    headBranch: payload.head_branch,
    createdAt: new Date(payload.created_at),
    updatedAt: new Date(payload.updated_at),
  };
};

const getDuration = (workflowRun: WorkflowRun): number => {
  return (
    (workflowRun.updatedAt.getTime() - workflowRun.createdAt.getTime()) / 1000
  );
};

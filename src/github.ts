import { Endpoints } from '@octokit/types';
import { Context } from '@actions/github/lib/context';
import { Octokit } from '@octokit/core';

export interface WorkflowRunPayload {
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

export interface WorkflowRun {
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

export type BillingData =
  | Endpoints['GET /orgs/{org}/settings/billing/actions']['response']['data']
  | Endpoints['GET /users/{username}/settings/billing/actions']['response']['data'];

export const parseWorkflowRun = (payload: WorkflowRunPayload): WorkflowRun => {
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

export const getWorkflowDuration = (workflowRun: WorkflowRun): number => {
  return (
    (workflowRun.updatedAt.getTime() - workflowRun.createdAt.getTime()) / 1000
  );
};

type getOwnerActionsBillingParams = {
  context: Context;
  octokit: Octokit;
};

export const getActionsBillingData = async ({
  context,
  octokit,
}: getOwnerActionsBillingParams): Promise<BillingData> => {
  const owner = context.payload.repository?.owner.login as string;
  if ('organization' in context.payload) {
    const res = await octokit.request(
      'GET /orgs/{org}/settings/billing/actions',
      { org: owner },
    );
    return res.data;
  } else {
    const res = await octokit.request(
      'GET /users/{username}/settings/billing/actions',
      { username: owner },
    );
    return res.data;
  }
};

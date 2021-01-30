import { getWorkflowTags } from '../src/sendMetrics';
import { WorkflowRun } from '../src/github';
import { Context } from '@actions/github/lib/context';

describe('#getTags', () => {
  it('returns tags', () => {
    // @ts-ignore
    const context = {
      repo: {
        owner: 'yuya-takeyama',
        repo: 'testrepo',
      },
    } as Context;
    const workflowRun: WorkflowRun = {
      id: 1,
      url: 'https://api.github.com',
      runNumber: 1,
      workflowId: 1,
      workflowUrl: 'https://api.github.com',
      name: 'test-workflow',
      event: 'push',
      status: 'completed',
      conclusion: 'success',
      headBranch: 'add-test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const tags = getWorkflowTags(context, workflowRun);
    expect(tags).toEqual([
      'repository_owner:yuya-takeyama',
      'repository_name:testrepo',
      'workflow_name:test-workflow',
      'event:push',
      'conclusion:success',
      'branch:add-test',
    ]);
  });
});

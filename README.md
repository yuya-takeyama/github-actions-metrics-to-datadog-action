<p align="center">
  <a href="https://github.com/linux-wizard/github-actions-metrics-to-datadog-action"><img alt="github-actions-metrics-to-datadog-action status" src="https://github.com/linux-wizard/github-actions-metrics-to-datadog-action/workflows/build-test/badge.svg"></a>
  <a href="https://github.com/pre-commit/pre-commit"><img src="https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit&logoColor=white" alt="pre-commit" style="max-width:100%;"></a>
</p>




# GitHub Actions metrics to Datadog

Send metrics of GitHub Actions to Datadog

## Usage

```yaml
on:
  workflow_run:
    workflows:
      - '**'
    types:
      - completed

jobs:
  actions-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: linux-wizard/github-actions-metrics-to-datadog-action@v0.5.0
        with:
          github-token: ${{ secrets.OWNER_GITHUB_TOKEN }}
          datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
          enable-workflow-metrics: 'true'
          enable-billing-metrics: 'true'
          enable-repository-workflows-billing-metrics: 'true'
```

### Collect billing metrics periodically

You can collect billing metrics using `schedule` event too:

```yaml
on:
  schedule:
    - cron: '*/15 * * * *'

jobs:
  actions-billing-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: linux-wizard/github-actions-metrics-to-datadog-action@v0.5.0
        with:
          github-token: ${{ secrets.OWNER_GITHUB_TOKEN }}
          datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
          enable-billing-metrics: 'true'
          enable-repository-workflows-billing-metrics: 'true'
```

## Inputs

| Name                                          | Required | Default | Description                                             |
|-----------------------------------------------|----------|---------|---------------------------------------------------------|
| `github-token`                                | `false`  |         | GitHub API token                                        |
| `datadog-api-key`                             | `true`   |         | Datadog API key                                         |
| `enable-workflow-metrics`                     | `true`   |         | Set "true" to send workflow metrics                     |
| `enable-billing-metrics`                      | `true`   |         | Set "true" to send User/Organization billing metrics    |
| `enable-repository-workflows-billing-metrics` | `true`   |         | Set "true" to send Repository Workflows billing metrics |

### Required scopes for `github-token`

It's required when `enable-billing-metrics` or `enable-repository-workflows-billing-metrics` is true.

`secrets.GITHUB_TOKEN` doesn't work for it.

#### A repo belongs to a user

* `user`

Details: https://docs.github.com/en/rest/reference/billing#get-github-actions-billing-for-a-user

#### A repo belongs to an organization

* `repo`
* `admin:org`

Also, the token must be created by a user who has ownership for the organization.

Details:

* https://docs.github.com/en/rest/reference/billing#get-github-actions-billing-for-an-organization
* https://docs.github.com/en/rest/reference/actions#get-workflow-usage

## Metrics

### Workflow metrics

* `github.actions.workflow_duration`

### Billing metrics

* `github.actions.billing.total_minutes_used`
* `github.actions.billing.total_paid_minutes_used`
* `github.actions.billing.included_minutes`
* `github.actions.billing.minutes_used_breakdown`

### Repository workflows billing metrics

* `github.actions.billing.repository_workflow_total_ms`

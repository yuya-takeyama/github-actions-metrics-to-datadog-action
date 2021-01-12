<p align="center">
  <a href="https://github.com/yuya-takeyama/github-actions-metrics-to-datadog-action"><img alt="typescript-action status" src="https://github.com/yuya-takeyama/github-actions-metrics-to-datadog-action/workflows/build-test/badge.svg"></a>
</p>

# GitHub Actions metrics to Datadog

Send metrics of GitHub Actions to Datadog

## Usage

```yaml
name: github-actions-metrics-to-datadog-action

on:
  workflow_run:
    workflows:
      - '*'
    types:
      - completed

steps:
  - uses: yuya-takeyama/github-actions-metrics-to-datadog-action@v0.1.0
    with:
      datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
```

## Inputs

| Name              | Required | Default | Description     |
|-------------------|----------|---------|-----------------|
| `datadog-api-key` | `true`   |         | Datadog API key |

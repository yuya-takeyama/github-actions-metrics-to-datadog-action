import fetch, { Response } from 'node-fetch';

export interface Metrics {
  series: Metric[];
}

interface Metric {
  host?: string;
  metric: string;
  points: MetricPoint[];
  tags?: string[];
}

export type MetricPoint = [number, number];

type PostMetricsResult = {
  response: Response;
};

export const postMetrics = async (
  apiKey: string,
  metrics: Metrics,
): Promise<PostMetricsResult> => {
  const res = await fetch(
    `https://api.datadoghq.com/api/v1/series?api_key=${apiKey}`,
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    },
  );
  if (res.status !== 202) {
    throw new Error(`Error response from Datadog: ${res.status}`);
  }

  return { response: res };
};
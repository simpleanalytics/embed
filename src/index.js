import {
  Chart,
  LineController,
  Filler,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Title,
} from "chart.js";

Chart.register(
  LineController,
  Filler,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title
);

import { options, colors } from "./defaults.js";

const generateLabel = (day) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  }).format(new Date(day.date));

const headers = {
  "Content-Type": "application/json",
};

const dataset = {
  fill: "origin",
  borderWidth: 3,
  pointRadius: 0,
  hoverBorderWidth: 3,
};

const host = "https://simpleanalytics.com";
const hostname = document.currentScript?.dataset.hostname;
const yMax = document.currentScript?.dataset.yMax;
const canvasId = document.currentScript?.dataset.canvasId;
const start = document.currentScript?.dataset.start;
const end = document.currentScript?.dataset.end;
const ctx = document.getElementById(canvasId)?.getContext("2d");

const params = new URLSearchParams([
  ["info", "false"],
  ["version", "5"],
  ["fields", "histogram"],
  ["start", start],
  ["end", end],
]);

(async () => {
  const url = `${host}/${hostname}.json?${params}`;
  const response = await fetch(url, { headers });
  const json = await response.json();
  const labels = json?.histogram.map(generateLabel);

  const pageviews = json?.histogram.map((day) => day.pageviews);
  const visitors = json?.histogram.map((day) => day.visitors);

  const data = {
    labels,
    datasets: [
      {
        ...dataset,
        order: 2,
        label: "Page views",
        borderColor: [colors.pageviews.border],
        backgroundColor: [colors.pageviews.background],
        data: pageviews,
      },
      {
        ...dataset,
        order: 1,
        label: "Visitors",
        borderColor: [colors.visitors.border],
        backgroundColor: [colors.visitors.background],
        data: visitors,
      },
    ],
  };

  if (yMax) options.scales.y.max = yMax;

  const chart = new Chart(ctx, {
    type: "line",
    data,
    options,
  });
})();

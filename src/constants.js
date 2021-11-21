import { k } from "./utils";

export const docs = "https://docs.simpleanalytics.com/embed-chart-on-your-site";
export const host = "https://simpleanalytics.com";

export const options = {
  interaction: {
    intersect: false,
    mode: "index",
  },
  animation: {
    duration: 0,
  },
  elements: {
    line: {
      tension: 0,
    },
  },
  scales: {
    y: {
      display: true,
      beginAtZero: true,
      ticks: {
        callback: function (label) {
          if (Math.floor(label) === label) return k(label);
        },
      },
    },
    x: {
      display: true,
      type: "time",
      time: { tooltipFormat: "MMMM d, yyyy" },
      ticks: {
        maxRotation: 0,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      displayColors: false,
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || "";

          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null) {
            label += k(context.parsed.y);
          }
          return label;
        },
      },
    },
  },
};

const blueDark = "#24acfc";
const blueLight = "#abe0ff";
const greenBlueDark = "#00c5e5";
const greenBlueLight = "#dff6fa";

export const colors = {
  pageViews: { border: blueDark, background: blueLight },
  visitors: { border: greenBlueDark, background: greenBlueLight },
};

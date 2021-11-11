import { k } from "./utils";

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
      type: "category",
      ticks: { maxRotation: 0 },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      displayColors: false,
    },
  },
};

const blueDark = "#24acfc";
const blueLight = "#abe0ff";
const greenBlueDark = "#00c5e5";
const greenBlueLight = "#dff6fa";

export const colors = {
  pageviews: { border: blueDark, background: blueLight },
  visitors: { border: greenBlueDark, background: greenBlueLight },
};

import {
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";
import cloneDeep from "lodash.clonedeep";

import { colors, docs, host, options } from "./constants";
import { log, prefix } from "./logger";
import {
  removeChildren,
  k,
  getSetting,
  addOpacity,
  createSVGLogo,
} from "./utils";

// Stop script when it's included already
if (window.saEmbedScriptLoaded) {
  throw new Error(`${prefix} Only embed our script once.`);
} else {
  window.saEmbedScriptLoaded = true;
}

Chart.register(
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip
);

const headers = { "Content-Type": "application/json" };
const mainDataset = document.currentScript?.dataset || {};
let siteTextColor;

const dataset = {
  fill: "origin",
  borderWidth: 2,
  pointRadius: 0,
  hoverBorderWidth: 2,
};

let userTimezone;
try {
  userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
} catch (error) {
  /* Do nothing */
}

const generateChart = async (chartOptions) => {
  const {
    legacy,
    element,
    start,
    end,
    hostname,
    color,
    yMax,
    expose,
    timezone,
    pageViewsElement,
    visitorsElement,
  } = chartOptions;

  const params = new URLSearchParams([
    ["info", "false"],
    ["version", "5"],
    ["fields", "histogram,pageviews,visitors"],
  ]);

  if (start) params.set("start", start);
  if (end) params.set("end", end);
  if (timezone || userTimezone)
    params.set("timezone", timezone || userTimezone);

  const url = `${host}/${hostname}.json?${params}`;
  const response = await fetch(url, { headers });
  const json = await response.json();
  const labels = json?.histogram.map(({ date }) => date);

  const pageViews = json?.histogram.map((day) => day.pageviews);
  const visitors = json?.histogram.map((day) => day.visitors);

  const borderWidth = getSetting({
    default: "2",
    value: mainDataset.borderWidth || chartOptions.borderWidth,
    regex: /[0-9]{1,2}/i,
    warning: 'Invalid border width, enter a number in pixels, eg: "2"',
  });

  dataset.borderWidth = borderWidth;
  dataset.hoverBorderWidth = borderWidth;

  const borderColorPageViews = getSetting({
    default: colors.pageViews.border,
    value: mainDataset.pageViewsColor || chartOptions.pageViewsColor || color,
    regex: /[0-9a-f]{6}/i,
    warning: 'Invalid page views color, enter a hex color, eg: "66ff00"',
    normalize: (value) => "#" + value.replace("#", ""),
  });

  const borderColorVisitors = getSetting({
    default: colors.visitors.border,
    value: mainDataset.visitorsColor || chartOptions.visitorsColor || color,
    regex: /[0-9a-f]{6}/i,
    warning: 'Invalid visitors color, enter a hex color, eg: "66ff00"',
    normalize: (value) => "#" + value.replace("#", ""),
  });

  const areaOpacityPercent = getSetting({
    default: "20",
    value: mainDataset.areaOpacity || chartOptions.areaOpacity,
    regex: /(100|[0-9]{1,2})/i,
    warning: 'Invalid opacity, enter a number between 1-100, eg: "50"',
  });

  const backgroundColorPageViews = addOpacity(
    borderColorPageViews,
    areaOpacityPercent
  );
  const backgroundColorVisitors = addOpacity(
    borderColorVisitors,
    areaOpacityPercent
  );

  const textColor = getSetting({
    default: siteTextColor || "#000000",
    value: mainDataset.textColor || chartOptions.textColor,
    regex: /[0-9a-f]{6}/i,
    warning: 'Invalid visitors color, enter a hex color, eg: "66ff00"',
    normalize: (value) => "#" + value.replace("#", ""),
  });

  const types = getSetting({
    default: legacy ? ["pageviews"] : ["visitors"],
    value: mainDataset.types || chartOptions.types,
    regex: /[a-z, ]+/i,
    warning: 'Invalid types, try: "pageviews,visitors"',
    normalize: (value) => value.split(",").map((value) => value.trim()),
  });

  if (!types.length) types.push("visitors");

  const datasets = [];

  if (types.includes("pageviews")) {
    datasets.push({
      ...dataset,
      order: 2,
      label: "Page views",
      borderColor: [borderColorPageViews],
      backgroundColor: [backgroundColorPageViews],
      data: pageViews,
    });
  }

  if (types.includes("visitors"))
    datasets.push({
      ...dataset,
      order: 1,
      label: "Visitors",
      borderColor: [borderColorVisitors],
      backgroundColor: [backgroundColorVisitors],
      data: visitors,
    });

  const data = { labels, datasets };

  // Make sure these chart options are not applied to other charts
  const optionsCopy = cloneDeep(options);
  if (yMax) optionsCopy.scales.y.max = yMax;

  // Do DOM manupilations
  removeChildren(element);
  const canvas = document.createElement("canvas");
  canvas.ariaLabel = `Chart with visitors data from ${hostname}`;
  element.appendChild(canvas);

  Chart.defaults.color = textColor;
  Chart.defaults.borderColor = addOpacity(textColor, 7);

  const chart = new Chart(canvas, {
    type: "line",
    data,
    options: optionsCopy,
  });

  // Show numbers in HTML elements
  if (pageViewsElement) pageViewsElement.textContent = k(json.pageviews);
  if (visitorsElement) visitorsElement.textContent = k(json.visitors);

  // Expose so customer can modify Chart instance
  if (expose && expose !== "false") window[expose] = chart;

  // Update text color on dark mode change
  const updateTextColor = () => {
    const p = document.querySelector("p");
    const { color } = getComputedStyle(p) || {};
    if (color === chart.options.scales.y.ticks.color) return;
    chart.options.scales.y.ticks.color = color;
    chart.options.scales.x.ticks.color = color;
    chart.update();
  };

  // Listen for dark mode change
  if (window.matchMedia)
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        window.setTimeout(() => updateTextColor(), 0);
        window.setTimeout(() => updateTextColor(), 500);
      });

  // Only draw when parent element has a valid position
  const { position } = getComputedStyle(element) || {};
  if (!["static", "relative"].includes(position)) return;

  // Make container relative
  element.style.position = "relative";

  // Get margins
  const marginTop = chart.scales.y?._margins?.top || 10;
  const boxSize = 40;
  const boxSpacing = 25;
  const top = marginTop + boxSpacing;

  // Create link element
  const box = document.createElement("a");
  box.style.all = "unset";
  box.style.position = "absolute";
  box.style.top = `${top}px`;
  box.style.left = `${chart.scales.y.width + boxSpacing}px`;
  box.style.height = `${boxSize}px`;
  box.style.width = `${boxSize}px`;
  box.style.borderRadius = "5px";
  box.style.color = borderColorVisitors;
  box.style.backgroundColor = backgroundColorVisitors;
  box.style.border = `${borderWidth}px solid ${borderColorVisitors}`;
  box.style.opacity = "0.5";
  box.style.cursor = "pointer";
  box.style.display = "flex";
  box.style.justifyContent = "center";
  box.style.alignItems = "center";

  // Link to public dashboard
  box.title = `Go to Simple Analytics dashboard`;
  box.ariaLabel = "Open public dashboard of this chart on Simple Analytics";
  box.href = `${host}/${hostname}?utm_source=${hostname}&utm_medium=embed`;
  box.referrerPolicy = "no-referrer-when-downgrade";
  box.target = "_blank";
  box.rel = "noopener";

  // Bind hover styles
  box.addEventListener("mouseenter", () => {
    box.style.opacity = "1";
  });
  box.addEventListener("mouseleave", () => {
    box.style.opacity = "0.5";
  });

  // Attach to DOM
  const svg = createSVGLogo({ fill: borderColorVisitors });
  svg.ariaLabel = "Simple Analytics logo";
  box.appendChild(svg);
  element.appendChild(box);
};

const triggerOnload = (ok = false) => {
  const onload = mainDataset?.onload;
  if (!onload) return;

  if (!/[a-z0-9_]+/i.test(onload)) {
    return log(`data-onload should only contain function name`, "error");
  } else if (typeof window[onload] !== "function") {
    return log(
      `function name in data-onload does not link to function type`,
      "error"
    );
  } else {
    window[onload](ok);
  }
};

function onReady() {
  // Grab default text color of host website
  const p = document.querySelector("p");
  const { color } = getComputedStyle(p) || {};
  siteTextColor = color;

  // Get legacy elements
  const legacyElements = document.querySelectorAll("[data-sa-graph-url]");

  if (legacyElements.length)
    log(
      `You're using the legacy embed feature, upgrade when you have time: ${docs}`,
      "warn"
    );

  // Get latest elements
  const elements = document.querySelectorAll(mainDataset?.chartSelectors);

  // Stop when no elements are found
  if (!legacyElements.length && !elements.length) {
    triggerOnload(false);
    return log("No elements found for chart selectors.", "error");
  }

  // Create a list of charts
  const charts = [];

  // Normalize legacy chart elements
  legacyElements.forEach((element) => {
    try {
      const { dataset } = element;
      const { saGraphUrl, saPageViewsSelector } = dataset;
      const { pathname, searchParams } = new URL(saGraphUrl);
      const hostname = pathname.slice(1);
      const color = searchParams.get("color");
      const yMax = searchParams.get("y-limit") || searchParams.get("max_y");
      const start = searchParams.get("start");
      const end = searchParams.get("end");

      charts.push({
        legacy: true,
        element,
        hostname,
        color,
        yMax,
        start,
        end,
        pageViewsElement: document.querySelector(saPageViewsSelector),
      });
    } catch (error) {
      triggerOnload(false);
      throw new Error(`${prefix} ${error.message}`);
    }
  });

  // Normalize latest chart elements
  elements.forEach((element) => {
    try {
      const { dataset } = element;
      const {
        hostname,
        color,
        yMax,
        start,
        end,
        timezone,
        expose = "saChart",
        pageViewsSelector,
        visitorsSelector,
        borderWidth,
        textColor,
        pageViewsColor,
        visitorsColor,
        areaOpacity,
        types,
      } = dataset;

      charts.push({
        legacy: false,
        element,
        hostname,
        color,
        yMax,
        start,
        end,
        expose,
        timezone: mainDataset.timezone || timezone || null,
        pageViewsElement: document.querySelector(pageViewsSelector),
        visitorsElement: document.querySelector(visitorsSelector),
        borderWidth,
        textColor,
        pageViewsColor,
        visitorsColor,
        areaOpacity,
        types,
      });
    } catch (error) {
      triggerOnload(false);
      throw new Error(`${prefix} ${error.message}`);
    }
  });

  // Run generate chart on every chart in the list
  Promise.all(charts.map(generateChart))
    .then(() => triggerOnload(true))
    .catch((message) => {
      triggerOnload(false);
      log(message, "error");
    });
}

// Load embed script when page is ready
(function saInitEmbed(window) {
  // Skip server side rendered pages
  if (typeof window === "undefined" || typeof document === "undefined")
    return triggerOnload(false);

  if (document.readyState === "ready" || document.readyState === "complete") {
    onReady();
  } else {
    document.addEventListener("readystatechange", function (event) {
      if (event.target.readyState === "complete") onReady();
    });
  }
})(window);

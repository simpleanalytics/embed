import { log } from "./logger";

export const thousandsSeparator = (number) => {
  if (!["number", "string"].includes(typeof number)) {
    console.warn(
      `thousandsSeparator got invalid value: ${number} (${typeof number})`
    );
    return "?";
  }
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const k = (number, roundNumbers = true) => {
  if (roundNumbers === false) return thousandsSeparator(number);

  if (number < 1000) return number;
  if (number >= 10000000000) return (number / 1000000000).toFixed(0) + "G";
  if (number >= 1000000000)
    return (number / 1000000000).toFixed(1).replace(/\.0$/, "") + "G";
  if (number >= 10000000) return (number / 1000000).toFixed(0) + "M";
  if (number >= 1000000)
    return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (number >= 10000) return (number / 1000).toFixed(0) + "k";
  if (number % 1000 === 0) return (number / 1000).toFixed(0) + "k";
  return (number / 1000).toFixed(1) + "k";
};

export const generateLabel = (day) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  }).format(new Date(day.date));

export const removeChildren = (parent) => {
  while (parent.lastChild) {
    parent.removeChild(parent.lastChild);
  }
};

export const getSetting = ({
  value,
  default: defaultValue,
  regex,
  warning,
  normalize,
}) => {
  if (typeof value === "undefined") return defaultValue;
  if (!regex.test(value)) {
    log(warning, "warn");
    return defaultValue;
  }
  if (typeof normalize === "function") return normalize(value);
  return value;
};

export const convertPercentToHex = (percentString) => {
  const percent = parseInt("" + percentString, 10);

  if (percent < 0) percent = 0;
  else if (percent > 100) percent = 100;

  const decimalValue = Math.round((percent * 255) / 100);
  if (percent < 7) return "0" + decimalValue.toString(16).toUpperCase();
  return decimalValue.toString(16).toUpperCase();
};

export const convertPercentToDecimal = (percentString) => {
  const percent = parseInt("" + percentString, 10);

  if (percent < 0) percent = 0;
  else if (percent > 100) percent = 100;

  return percent / 100;
};

export const addOpacity = (color, opacity) => {
  if (/#[0-9a-f]{6,}/i.test(color)) {
    const hex = color.slice(1, 7);
    return `#${hex}${convertPercentToHex(opacity)}`;
  }
  const rgbRegex = /rgb\(([0-9, ]+)\)/i;
  if (rgbRegex.test(color)) {
    const [, match] = color.match(rgbRegex);
    return `rgba(${match}, ${convertPercentToDecimal(opacity)})`;
  }

  return color;
};

export const createSVGLogo = ({ fill }) => {
  var xmlns = "http://www.w3.org/2000/svg";
  const boxWidth = 200;
  const boxHeight = 200;
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
  svg.style.display = "block";

  const bars = [
    "M66 101H50v48h16v-48ZM105 72H89v77h16V72ZM144 44h-16v105h16V44Z",
  ];

  for (const bar of bars) {
    const path = document.createElementNS(xmlns, "path");
    path.setAttributeNS(null, "d", bar);
    path.setAttributeNS(null, "fill", fill);
    svg.appendChild(path);
  }

  return svg;
};

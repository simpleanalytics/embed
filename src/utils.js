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

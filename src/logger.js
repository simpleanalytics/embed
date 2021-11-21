export const log = (message, severity = "info") => {
  if (console?.[severity]) console[severity](prefix, message);
};

export const prefix = "[Simple Analytics Embed]";

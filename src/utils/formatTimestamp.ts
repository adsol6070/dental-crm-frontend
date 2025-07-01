type FormatTimestampOptions = {
  locale?: string;
  timeZone?: string;
  formatOptions?: Intl.DateTimeFormatOptions;
};

export const formatTimestamp = (
  isoString: string,
  options: FormatTimestampOptions = {}
): string => {
  const {
    locale = "en-US",
    timeZone = "Asia/Kolkata",
    formatOptions = {
      year: "numeric",
      month: "long",
      day: "2-digit",
    },
  } = options;

  const date = new Date(isoString);
  return date.toLocaleDateString(locale, { ...formatOptions, timeZone });
};

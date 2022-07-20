import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

function formatPhoneNumber(phoneNumberString: string) {
  const cleaned = `${phoneNumberString}`.replace(/\D/g, '');
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    // const intlCode = match[1] ? '+1 ' : '';
    return [match[2], match[3], match[4]].join('');
  }
  return null;
}
function isValidHttpUrl(string: string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}

function getTimeAgo(dateString: string) {
  TimeAgo.addDefaultLocale(en);
  const timeAgo = new TimeAgo('en-US');
  const then = new Date(dateString);
  return timeAgo.format(then);
}

module.exports = { formatPhoneNumber, isValidHttpUrl, getTimeAgo };

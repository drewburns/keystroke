import axios from 'axios';
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

const truncate = (fullStr: string, strLen: number) => {
  if (fullStr.length <= strLen) return fullStr;

  const separator = '...';

  const sepLen = separator.length;
  const charsToShow = strLen - sepLen;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  return (
    fullStr.substr(0, frontChars) +
    separator +
    fullStr.substr(fullStr.length - backChars)
  );
};

function getTimeAgo(dateString: string) {
  TimeAgo.addDefaultLocale(en);
  const timeAgo = new TimeAgo('en-US');
  const then = new Date(dateString);
  return timeAgo.format(then);
}

const getPresignedPostUrl = async (imageType) => {
  const BASE_URL = 'http://localhost:8080';
  const res = await axios.post(BASE_URL + '/image', {
    fileType: imageType,
  });
  return res.data;
};

async function uploadToS3({ image, fileType }) {
  const presignedPostUrl = await getPresignedPostUrl(fileType);
  const formData = new FormData();
  formData.append('file', image);
  const response = await axios.put(presignedPostUrl, image, {
    headers: { 'Content-Type': fileType },
  });

  return presignedPostUrl.split('?')[0];
}

module.exports = {
  formatPhoneNumber,
  isValidHttpUrl,
  getTimeAgo,
  truncate,
  getPresignedPostUrl,
  uploadToS3,
};

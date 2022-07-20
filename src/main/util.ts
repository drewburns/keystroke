/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

export const showMessagePreview = (row: any) => {
  const { attach_list } = row;
  if (attach_list) {
    const returnString = `${attach_list.split(',').length} attachments`;
    // TODO: be more specific here
    return returnString;
  }
  return row['message.text'];

  // attachment_list ? `Attachment: ${attachment_list.split(",").}`
};

export const getChatUserHandle = (
  nameNumbers: any,
  numberList: string[],
  displayName = null
) => {
  if (displayName) {
    return displayName;
  }
  const list: string[] = [];
  if (numberList.length === 1) {
    return nameNumbers[formatPhoneNumber(numberList[0])] || numberList[0];
  }
  numberList.forEach((n) => {
    list.push(
      nameNumbers[formatPhoneNumber(n)]
        ? nameNumbers[formatPhoneNumber(n)].split(' ')[0]
        : n
    );
  });
  return list.join(', ');
};

export function formatPhoneNumber(phoneNumberString: string) {
  const cleaned = `${phoneNumberString}`.replace(/\D/g, '');
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    // const intlCode = match[1] ? '+1 ' : '';
    return [match[2], match[3], match[4]].join('');
  }
  return null;
}

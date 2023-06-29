export const secret =
  'lEZSegGQP79roJFvWxpAfVsXjsQ4YqtFp8d5RdxFYJ1AnqxS2NjDbaek1TVK6rk';

export const clientBaseURL =
  process.env['PROTOCOL'] +
  '://' +
  process.env['HOST_IP'] +
  ':' +
  process.env['CLIENT_PORT'] +
  '/';

export const apiBaseURL =
  process.env['PROTOCOL'] +
  '://' +
  process.env['HOST_IP'] +
  ':' +
  process.env['API_PORT'] +
  '/';

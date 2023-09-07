export const secret = process.env['JWT_SECRET'];

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

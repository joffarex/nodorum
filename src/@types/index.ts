declare module 'async-exit-hook';

/* eslint-disable-next-line @typescript-eslint/no-namespace */
declare namespace Express {
  interface Request {
    user?: any
  }
}
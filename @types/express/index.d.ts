import * as express from 'express';

declare global {
  namespace Express {
    interface Response {
      //   send: (message: string) => void;
    }
  }
}

// src/utils/logging.ts

/* eslint-disable no-console */

const isDev = process.env.NODE_ENV === "development";

export const log = (...args: any[]) => {
  if (isDev) {
    console.log(`[LOG ${new Date().toISOString()}]`, ...args);
  }
};

export const warn = (...args: any[]) => {
  if (isDev) {
    console.warn(`[WARN ${new Date().toISOString()}]`, ...args);
  }
};

export const error = (...args: any[]) => {
  if (isDev) {
    console.error(`[ERROR ${new Date().toISOString()}]`, ...args);
  }
};

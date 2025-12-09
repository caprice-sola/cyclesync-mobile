// Checks if you're running the dev server or a production build
const isDev = process.env.NODE_ENV === "development";

// Wrap console.log so ESLint doesn't see it directly
export const log = (...args: any[]) => {
  if (isDev) {
    console.log(`[LOG ${new Date().toISOString()}]`,...args);
  }
};

export const warn = (...args: any[]) => {
  if (isDev) {
    console.warn(`[LOG ${new Date().toISOString()}]`,...args);
  }
};

export const error = (...args: any[]) => {
  if (isDev) {
    console.error(`[LOG ${new Date().toISOString()}]`,...args);
  }
};

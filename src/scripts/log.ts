/**
 *
 * @param {string} category What part of the script we currently are in
 * @param {...any} params   Everything else, text, objects and so forth.
 */
export function log(category: string, ...params: any[]): void {
  if (timestampLogs) {
    params = [...params, new Date().toISOString()];
  }
  console.log(`[${category}]`, JSON.stringify([...params]));
}

var timestampLogs = false;

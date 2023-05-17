type Style = 'info' | 'error' | 'warn' | 'log';

const variantMap: Record<Style, string> = {
  log: 'background-color: black; color: white',
  info: 'background-color: #409c55; color: white',
  error: 'background-color: red; color: white',
  warn: 'background-color: #e99536; color: black',
};

const log = (variant: keyof typeof variantMap, ...args: unknown[]) => {
  const firstArg = args.shift();
  console.log(`%c${firstArg}`, `${variantMap[variant]}; padding: 1px 4px; border-radius: 4px`, ...args);
};

export const clog = (...args: unknown[]) => log('log', ...args);

clog.log = log.bind(null, 'log');
clog.info = log.bind(null, 'info');
clog.error = log.bind(null, 'error');
clog.warn = log.bind(null, 'warn');

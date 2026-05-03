const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const resolveLevel = () => {
  const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
  return LEVELS[envLevel] ?? LEVELS.info;
};

const minLevel = resolveLevel();

const log = (level, message, meta = {}) => {
  if (LEVELS[level] < minLevel) return;

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };

  console.log(JSON.stringify(payload));
};

module.exports = {
  debug: (message, meta) => log('debug', message, meta),
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta)
};

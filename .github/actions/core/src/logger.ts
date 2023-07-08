import { info, warning, notice, debug } from '@actions/core';

export const logger = {
  info: (msg: string) => info(msg),
  warning: (msg: string) => warning(msg),
  notice: (msg: string) => notice(msg),
  debug: (msg: string) => debug(msg),
};

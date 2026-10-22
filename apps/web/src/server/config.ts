import 'server-only';
import { parseServiceConfig } from './config-core';
export function serviceConfig() { return parseServiceConfig(process.env); }

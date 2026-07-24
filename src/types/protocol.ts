export const PROTOCOL_VERSION = '1.0.0' as const;

export type MessageType =
    | 'snapshot'
    | 'update'
    | 'stale'
    | 'heartbeat'
    | 'system'
    | 'error';

export interface ServerMessage<T> {
    version: typeof PROTOCOL_VERSION;
    sequence: number;
    timestamp: number;
    type: MessageType;
    payload: T;
}
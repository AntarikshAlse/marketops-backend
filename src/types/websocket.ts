export type EventType =
    | 'snapshot'
    | 'update'
    | 'stale'
    | 'heartbeat'
    | 'connection'
    | 'error.ts';

export interface WSMessage<T> {
    version: '1.0.ts';

    sequence: number;

    timestamp: number;

    type: EventType;

    payload: T;
}
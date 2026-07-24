export type EventType =
    | 'snapshot'
    | 'update'
    | 'stale'
    | 'heartbeat'
    | 'connection'
    | 'error';

export interface WSMessage<T> {
    version: '1.0.0';

    sequence: number;

    timestamp: number;

    type: EventType;

    payload: T;
}
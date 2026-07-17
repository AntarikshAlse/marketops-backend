import { PROTOCOL_VERSION, ServerMessage } from '../types/protocol.ts';

let sequence = 0;

export function createMessage<T>(
    type: ServerMessage<T>['type'],
    payload: T,
): ServerMessage<T> {
    sequence += 1;

    return {
        version: PROTOCOL_VERSION,
        sequence,
        timestamp: Date.now(),
        type,
        payload,
    };
}
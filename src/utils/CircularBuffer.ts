export class CircularBuffer<T> {
    private readonly buffer: (T | undefined)[];

    private head = 0;

    private length = 0;

    constructor(private readonly capacity: number) {
        this.buffer = new Array(capacity);
    }

    push(value: T) {
        this.buffer[this.head] = value;

        this.head = (this.head + 1) % this.capacity;

        if (this.length < this.capacity) {
            this.length++;
        }
    }

    toArray(): T[] {
        const result: T[] = [];

        const start =
            (this.head - this.length + this.capacity) %
            this.capacity;

        for (let i = 0; i < this.length; i++) {
            result.push(
                this.buffer[(start + i) % this.capacity]!,
            );
        }

        return result;
    }

    latest(): T | undefined {
        if (this.length === 0) return undefined;

        return this.buffer[
            (this.head - 1 + this.capacity) %
            this.capacity
        ];
    }

    size() {
        return this.length;
    }

    clear() {
        this.head = 0;
        this.length = 0;
    }
}
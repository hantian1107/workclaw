export interface IChannel {
  name: string;
  start(): void;
  stop(): void;
  send(userId: string, message: string): Promise<void>;
  onMessage(handler: (userId: string, message: string) => void): void;
}

export abstract class BaseChannel implements IChannel {
  public abstract name: string;
  protected messageHandler: ((userId: string, message: string) => void) | null = null;

  abstract start(): void;
  abstract stop(): void;
  abstract send(userId: string, message: string): Promise<void>;

  public onMessage(handler: (userId: string, message: string) => void): void {
    this.messageHandler = handler;
  }

  protected emitMessage(userId: string, message: string): void {
    if (this.messageHandler) {
      this.messageHandler(userId, message);
    }
  }
}

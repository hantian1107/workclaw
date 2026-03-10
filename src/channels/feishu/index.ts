import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { BaseChannel } from '../base';

export class FeishuChannel extends BaseChannel {
  public name = 'feishu';
  private app: Koa;
  private server: any;
  private port = 3000; // Configurable in real app

  constructor() {
    super();
    this.app = new Koa();
    this.app.use(bodyParser());

    this.app.use(async (ctx) => {
      // 1. URL Validation (Challenge)
      if (ctx.request.body && (ctx.request.body as any).challenge) {
        ctx.body = { challenge: (ctx.request.body as any).challenge };
        return;
      }

      // 2. Message Handling
      // Assuming event type is message
      // Real implementation needs signature verification and full event parsing
      const body = ctx.request.body as any;
      if (body && body.header && body.header.event_type === 'im.message.receive_v1') {
        const event = body.event;
        const senderId = event.sender.sender_id.open_id;
        const content = JSON.parse(event.message.content).text;

        this.emitMessage(senderId, content);
        ctx.status = 200;
      }
    });
  }

  start(): void {
    try {
      this.server = this.app.listen(this.port, () => {
        console.log(`Feishu channel listening on port ${this.port}`);
      });
    } catch (e) {
      console.error('Failed to start Feishu channel:', e);
    }
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  async send(userId: string, message: string): Promise<void> {
    // Real implementation would call Feishu Open API to send message
    console.log(`[Feishu] Mock sending to ${userId}: ${message}`);
    // await axios.post('https://open.feishu.cn/open-apis/im/v1/messages', ...)
  }
}

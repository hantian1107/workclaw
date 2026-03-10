import { ipcMain, IpcMainInvokeEvent, WebContents } from 'electron';
import { BaseChannel } from '../base';

export class IpcChannel extends BaseChannel {
  public name = 'ipc';
  private webContents: WebContents | null = null;

  start(): void {
    ipcMain.handle('chat:send', async (event: IpcMainInvokeEvent, message: string) => {
      // In IPC channel, we treat the sender as the active window user
      // We can use a fixed ID for the single user desktop scenario
      const userId = 'local-user';
      this.webContents = event.sender;
      
      this.emitMessage(userId, message);
      
      // We don't return here because the response comes asynchronously via send()
      // But for simple request-response, we might want to change this flow.
      // For now, let's stick to the event-driven model.
      return { status: 'processing' };
    });
  }

  stop(): void {
    ipcMain.removeHandler('chat:send');
    this.webContents = null;
  }

  async send(userId: string, message: string): Promise<void> {
    if (this.webContents && !this.webContents.isDestroyed()) {
      this.webContents.send('chat:receive', {
        id: Date.now().toString(),
        role: 'assistant',
        content: message
      });
    } else {
      console.warn('Cannot send message to UI: WebContents not available');
    }
  }
}

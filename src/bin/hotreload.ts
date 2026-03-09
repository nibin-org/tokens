import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import { createHash } from 'node:crypto';

interface Client {
  socket: Duplex;
  send: (data: string) => void;
}

export class HotReloadServer {
  private clients = new Set<Client>();

  handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer) {
    if (request.url !== '/__tokvista_ws') {
      socket.destroy();
      return;
    }

    const key = request.headers['sec-websocket-key'];
    if (!key) {
      socket.destroy();
      return;
    }

    const accept = createHash('sha1')
      .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
      .digest('base64');

    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
    );

    const client: Client = {
      socket,
      send: (data: string) => {
        const buffer = Buffer.from(data);
        const frame = Buffer.allocUnsafe(2 + buffer.length);
        frame[0] = 0x81;
        frame[1] = buffer.length;
        buffer.copy(frame, 2);
        socket.write(frame);
      }
    };

    this.clients.add(client);
    socket.on('close', () => this.clients.delete(client));
  }

  reload() {
    for (const client of this.clients) {
      client.send('reload');
    }
  }

  close() {
    for (const client of this.clients) {
      client.socket.destroy();
    }
    this.clients.clear();
  }
}

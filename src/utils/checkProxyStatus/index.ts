import { createConnection } from "net";

import { PROXY_CONNECT_TIMEOUT_MS, PROXY_PORT } from "../../constants";

export default function checkProxyStatus(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ port: PROXY_PORT, host: "127.0.0.1" });

    const finish = (running: boolean) => {
      socket.destroy();
      resolve(running);
    };

    socket.setTimeout(PROXY_CONNECT_TIMEOUT_MS);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

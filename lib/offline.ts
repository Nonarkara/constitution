export type OfflineStatus = "loading" | "ready" | "unavailable" | "unsupported";
export function workerMessage<T>(
  worker: ServiceWorker,
  message: unknown,
  timeoutMs = 15000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = setTimeout(() => {
      channel.port1.close();
      reject(new Error("Offline worker timed out"));
    }, timeoutMs);
    channel.port1.onmessage = (event) => {
      clearTimeout(timeout);
      channel.port1.close();
      resolve(event.data as T);
    };
    worker.postMessage(message, [channel.port2]);
  });
}

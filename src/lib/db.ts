let prismaClient: any = null;

async function getPrismaClient() {
  if (!prismaClient) {
    const { PrismaClient } = await import("@prisma/client");
    prismaClient = new PrismaClient();
  }
  return prismaClient;
}

// Proxy that lazily loads PrismaClient only when a property is accessed
export const db = new Proxy({} as any, {
  get(_target, prop) {
    if (prop === "then") return undefined; // prevent treating as thenable
    return new Proxy(() => {}, {
      get(_t, method) {
        return async (...args: any[]) => {
          const client = await getPrismaClient();
          return client[prop][method](...args);
        };
      },
      apply: async (_t, _thisArg, args) => {
        const client = await getPrismaClient();
        return client[prop](...args);
      },
    });
  },
});

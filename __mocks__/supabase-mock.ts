export interface ChainableMock {
  setResolveValue: (value: unknown) => void;
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  upsert: jest.Mock;
  eq: jest.Mock;
  neq: jest.Mock;
  gt: jest.Mock;
  gte: jest.Mock;
  lt: jest.Mock;
  lte: jest.Mock;
  like: jest.Mock;
  ilike: jest.Mock;
  is: jest.Mock;
  in: jest.Mock;
  contains: jest.Mock;
  containedBy: jest.Mock;
  range: jest.Mock;
  order: jest.Mock;
  limit: jest.Mock;
  or: jest.Mock;
  and: jest.Mock;
  not: jest.Mock;
  filter: jest.Mock;
  match: jest.Mock;
  single: jest.Mock;
  maybeSingle: jest.Mock;
  [key: string]: jest.Mock | ((value: unknown) => void);
}

export function createChainableMock(): ChainableMock {
  let resolveValue: unknown = { data: [], error: null };

  const createThenable = () => ({
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(resolve(resolveValue)),
    catch: () => Promise.resolve(),
  });

  const mock: ChainableMock = {} as ChainableMock;

  mock.setResolveValue = (value: unknown) => {
    resolveValue = value;
  };

  const createChainMethod = (): jest.Mock => {
    return jest.fn(() => {
      const thenable = { ...mock, ...createThenable() };
      return thenable;
    });
  };

  mock.select = createChainMethod();
  mock.insert = createChainMethod();
  mock.update = createChainMethod();
  mock.delete = createChainMethod();
  mock.upsert = createChainMethod();
  mock.eq = createChainMethod();
  mock.neq = createChainMethod();
  mock.gt = createChainMethod();
  mock.gte = createChainMethod();
  mock.lt = createChainMethod();
  mock.lte = createChainMethod();
  mock.like = createChainMethod();
  mock.ilike = createChainMethod();
  mock.is = createChainMethod();
  mock.in = createChainMethod();
  mock.contains = createChainMethod();
  mock.containedBy = createChainMethod();
  mock.range = createChainMethod();
  mock.order = createChainMethod();
  mock.limit = createChainMethod();
  mock.or = createChainMethod();
  mock.and = createChainMethod();
  mock.not = createChainMethod();
  mock.filter = createChainMethod();
  mock.match = createChainMethod();
  mock.single = jest.fn(() => Promise.resolve(resolveValue));
  mock.maybeSingle = jest.fn(() => Promise.resolve(resolveValue));

  return mock;
}

export function createSupabaseMock() {
  return {
    from: jest.fn(() => createChainableMock()),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  };
}

export class MockSupabaseError extends Error {
  public readonly code: string;
  public readonly originalError?: unknown;

  constructor(code: string, message: string, originalError?: unknown) {
    super(message);
    this.name = 'SupabaseError';
    this.code = code;
    this.originalError = originalError;
  }
}

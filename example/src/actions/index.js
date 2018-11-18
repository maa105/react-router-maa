export const NOOP = 'NOOP';

export const noopAction = () => ({
  type: NOOP
});

export * from './router.actions';
export * from './product.actions';

import { AuthEvents } from './auth.events';

describe('AuthEvents', () => {
  it('creates a typed login event', () => {
    expect(
      AuthEvents.loginRequested({
        kind: 'login',
        email: 'chris@example.com',
        password: 'password',
        rememberMe: false,
      })
    ).toEqual({
      type: '[Auth Page] loginRequested',
      payload: {
        kind: 'login',
        email: 'chris@example.com',
        password: 'password',
        rememberMe: false,
      },
    });
  });
});

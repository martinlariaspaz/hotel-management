import MVP_USER_ROLE_VALUES from './userRoleContract';

describe('userRoleContract', () => {
  it('matches the MVP staff role contract', () => {
    expect(MVP_USER_ROLE_VALUES).toEqual([
      'admin',
      'reception',
      'housekeeping',
      'management',
    ]);
  });
});

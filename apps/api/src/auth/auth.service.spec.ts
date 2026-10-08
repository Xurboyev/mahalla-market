import { AuthService } from './auth.service';

describe('AuthService.normalizePhone', () => {
  it('9 xonali raqamni +998 ga to\'ldiradi', () => {
    expect(AuthService.normalizePhone('90 123 45 67')).toBe('+998901234567');
  });
  it('to\'liq formatni qabul qiladi', () => {
    expect(AuthService.normalizePhone('+998 (90) 123-45-67')).toBe('+998901234567');
  });
  it('noto\'g\'ri raqamni rad etadi', () => {
    expect(() => AuthService.normalizePhone('12345')).toThrow();
  });
});

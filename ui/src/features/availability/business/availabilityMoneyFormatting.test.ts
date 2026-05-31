import { formatAvailabilityMoney } from './availabilityMoneyFormatting';

describe('availabilityMoneyFormatting', () => {
  it('formats ARS values with the currency code and no cents', () => {
    const formattedValue = formatAvailabilityMoney(120000, 'ARS', {
      locale: 'es-AR',
    });

    expect(formattedValue).toContain('ARS');
    expect(formattedValue).toContain('120.000');
    expect(formattedValue).not.toContain(',00');
  });

  it('keeps the currency code visible for English formatting', () => {
    expect(
      formatAvailabilityMoney(90000, 'ARS', { locale: 'en' }),
    ).toContain('ARS');
  });

  it('falls back gracefully for unsupported currency codes', () => {
    expect(
      formatAvailabilityMoney(1000, 'ROOM_CREDITS', { locale: 'en' }),
    ).toBe('ROOM_CREDITS 1,000');
  });
});

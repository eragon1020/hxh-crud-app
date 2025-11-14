describe('Sample Test', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should validate string', () => {
    const greeting = 'Hello World';
    expect(greeting).toBe('Hello World');
  });

  test('should check array', () => {
    const characters = ['Gon', 'Killua', 'Kurapika'];
    expect(characters).toHaveLength(3);
    expect(characters).toContain('Gon');
  });
});
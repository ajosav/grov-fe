import {uuidv7, webDevice} from './device';

describe('device', () => {
  it('makes RFC 9562 v7 ids', () => {
    expect(uuidv7()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });
  it('keeps one id per browser', () => {
    const first = webDevice();
    expect(first.platform).toBe('WEB');
    expect(webDevice().id).toBe(first.id);
  });
});

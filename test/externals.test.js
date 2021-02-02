/**
 * @file
 * Tests externals mapping.
 */

const { deepStrictEqual, strictEqual } = require('assert');
const { externalsMatcher } = require('../lib/externals');

/**
 * Generates a random string.
 *
 * @param {number} [length=8] Length of the string to generate.
 * @return {string} The random string.
 */
const randomString = (length = 8) =>
  Math.random()
    .toString(36)
    .substring(2, 2 + length);

describe('externalsMatcher()', function () {
  it('should return dynamic mappings for jQuery UI widgets', function () {
    const component = randomString();
    deepStrictEqual(externalsMatcher(`jquery-ui/ui/widgets/${component}`), {
      library: `core/jquery.ui.${component}`,
      external: 'undefined',
    });
  });

  it('should return dynamic mappings for Drupal libraries', function () {
    const library = `${randomString()}/${randomString()}`;
    deepStrictEqual(externalsMatcher(`Drupal/${library}`), {
      library,
      external: 'Drupal',
    });
  });

  describe('Invalid requests', function () {
    it('should return false for Drupal library with no slash', function () {
      strictEqual(externalsMatcher(`Drupal/${randomString()}`), false);
    });

    it('should return false for Drupal library with invalid name', function () {
      strictEqual(
        externalsMatcher(`Drupal/${randomString()}./${randomString()}`),
        false,
      );
    });

    it('should return false for unrelated imports', function () {
      strictEqual(externalsMatcher(randomString()), false);
    });
  });
});

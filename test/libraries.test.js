/**
 * @file
 * Tests externals mapping.
 */

const { deepStrictEqual, strictEqual } = require('assert');
const { randomString } = require('./utils');
const { librariesMatcher } = require('../lib/libraries');

describe('librariesMatcher()', function () {
  it('should return dynamic mappings for jQuery UI widgets', function () {
    const component = randomString();
    deepStrictEqual(librariesMatcher(`jquery-ui/ui/widgets/${component}`), {
      library: `core/jquery.ui.${component}`,
      external: `jQuery/*core/jquery.ui.${component}*/`,
    });
  });

  it('should return dynamic mappings for Drupal libraries', function () {
    const library = `${randomString()}/${randomString()}`;
    deepStrictEqual(librariesMatcher(`Drupal/${library}`), {
      library,
      external: `Drupal/*${library}*/`,
    });
  });

  describe('Invalid requests', function () {
    it('should return false for Drupal library with no slash', function () {
      strictEqual(librariesMatcher(`Drupal/${randomString()}`), false);
    });

    it('should return false for Drupal library with invalid name', function () {
      strictEqual(
        librariesMatcher(`Drupal/${randomString()}./${randomString()}`),
        false,
      );
    });

    it('should return false for unrelated imports', function () {
      strictEqual(librariesMatcher(randomString()), false);
    });
  });
});

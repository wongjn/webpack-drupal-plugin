/**
 * @file
 * Tests externals mapping.
 */

const { deepStrictEqual, strictEqual } = require('assert');
const { randomString } = require('./utils');
const { librariesMatcher } = require('../lib/libraries');

describe('librariesMatcher()', function () {
  it('should return dynamic mappings for Drupal libraries', function () {
    const library = `${randomString()}/${randomString()}`;
    deepStrictEqual(librariesMatcher(`Drupal/${library}`), {
      library,
      external: `window.Drupal/*${library}*/`,
    });
  });

  describe('CKEditor5 Plugins', function () {
    it('should return dynamic mappings', function () {
      const plugin = 'special-characters';
      deepStrictEqual(librariesMatcher(`@ckeditor/ckeditor5-${plugin}`), {
        library: 'core/ckeditor5.specialCharacters',
        external: 'CKEditor5.specialCharacters',
      });
    });

    const nameDeviations = [
      { name: 'basic-styles', expected: 'basic' },
      { name: 'block-quote', expected: 'blockquote' },
    ];
    nameDeviations.forEach(({ name, expected }) => {
      it(`should return core/ckeditor5.${expected} for @ckeditor/ckeditor5-${name}`, function () {
        deepStrictEqual(librariesMatcher(`@ckeditor/ckeditor5-${name}`), {
          library: `core/ckeditor5.${expected}`,
          external: `CKEditor5.${expected}`,
        });
      });
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

/**
 * @file
 * Test the PHP file output.
 */

const { strictEqual } = require('assert');
const fs = require('fs').promises;
const { optimize } = require('webpack');
const {
  cleanDist,
  runWebpack,
  FIXTURES_DIST,
  randomString,
} = require('./utils');
const DrupalPlugin = require('..');

const getContent = () => fs.readFile(`${FIXTURES_DIST}/assets.php`, 'utf8');

const HEADER = `<?php

/**
 * @file
 * Contains the assets compiled from Webpack.
 *
 * Include this within hook_libraries_info_build():
 * @code
 * function extension_name_libraries_info_build() {
 *   $libraries = include __DIR__ . '/dist/assets.php';
 *   return $libraries;
 * }
 * @endcode
 */
`;

/**
 * Asserts a built file exists.
 *
 * @param {string} filename Name of the file to assert exists.
 */
const assertBuiltFileExists = async (filename) => {
  const files = await fs.readdir(FIXTURES_DIST);
  strictEqual(files.includes(filename), true, `${filename} exists.`);
};

describe('PHP file', function () {
  afterEach(cleanDist);

  it('should create appropriate PHP file content', async function () {
    await runWebpack({
      entry: {
        main: './src/simple-drupal-import.js',
        other: './src/simple-drupal-import-0.js',
      },
    });

    await assertBuiltFileExists('assets.php');

    const expected = `${HEADER}
return [
  'main' => [
    'js' => [
      'dist/main.js' => [],
    ],
    'dependencies' => [
      'core/drupal',
    ],
  ],
  'other' => [
    'js' => [
      'dist/other.js' => [],
    ],
    'dependencies' => [
      'extension/library',
      'core/drupalSettings',
    ],
  ],
];
`;
    strictEqual(await getContent(), expected, 'Expected file content.');

    await runWebpack({
      entry: {
        main: './src/simple-drupal-import.js',
        other: './src/simple-drupal-import-0.js',
      },
      plugins: [new DrupalPlugin(), new optimize.ModuleConcatenationPlugin()],
    });
    strictEqual(await getContent(), expected, 'With concatenation plugin.');
  });

  it('should specify all entry chunks', async function () {
    await runWebpack({ optimization: { runtimeChunk: true } });
    const expected = `${HEADER}
return [
  'main' => [
    'js' => [
      'dist/runtime~main.js' => [],
      'dist/main.js' => [],
    ],
    'dependencies' => [
      'core/drupal',
    ],
  ],
];
`;

    strictEqual(await getContent(), expected, 'All JavaScript files included.');
  });

  it('should propagate minified option from Webpack', async function () {
    await runWebpack({ optimization: { minimize: true } });
    const expected = `${HEADER}
return [
  'main' => [
    'js' => [
      'dist/main.js' => [
        'minified' => TRUE,
      ],
    ],
    'dependencies' => [
      'core/drupal',
    ],
  ],
];
`;
    strictEqual(await getContent(), expected);
  });

  it('should use the "filename" option', async function () {
    const slug = randomString();
    await runWebpack({
      plugins: [new DrupalPlugin({ filename: `${slug}.inc` })],
    });
    await assertBuiltFileExists(`${slug}.inc`);
  });
});

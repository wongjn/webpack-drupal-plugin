/**
 * @file
 * Writes output.
 */

/** @typedef {boolean|null|string|number|Object} PHPConvertable */

/**
 * @callback ValueConverter
 *
 * @param {PHPConvertable} value The value to convert.
 * @param {number} [indentLevel=0] Current level of indentation.
 * @return {string} PHP value as a string.
 */

/**
 * Gets an indent string for a indent level.
 *
 * @param {number} indentLevel Indent level. 0 is no indentation.
 * @return {string} Indentation string.
 */
const getIndent = (indentLevel) => ' '.repeat(indentLevel * 2);

/**
 * Returns a mapper for elements of a sequenced array.
 *
 * @param {number} indentLevel Indent level. 0 is no indentation.
 * @param {ValueConverter} valueConvert Converter function for child elements.
 * @return {(value: PHPConvertable) => string} Mapper.
 */
const toSequenceArray = (indentLevel, valueConvert) => {
  const indent = getIndent(indentLevel);
  return (value) => `${indent}${valueConvert(value, indentLevel)}`;
};

/**
 * Returns a mapper for elements of an associative array.
 *
 * @param {number} indentLevel Indent level. 0 is no indentation.
 * @param {ValueConverter} valueConvert Converter function for child elements.
 * @return {(entry: [string,PHPConvertable]) => string} Mapper.
 */
const toAssocArray = (indentLevel, valueConvert) => {
  const indent = getIndent(indentLevel);
  return ([key, value]) =>
    `${indent}${valueConvert(key)} => ${valueConvert(value, indentLevel)}`;
};

/**
 * Converts a convertable JavaScript value to a PHP value.
 *
 * @type {ValueConverter}
 */
const toPhp = (value, indentLevel = 0) => {
  if (typeof value === 'boolean') return value.toString().toUpperCase();
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'number') return value.toString();
  if (value === null) return 'NULL';

  const entries = Array.isArray(value) ? value : [...Object.entries(value)];
  if (entries.length === 0) return '[]';

  const mapper = Array.isArray(value)
    ? toSequenceArray(indentLevel + 1, toPhp)
    : toAssocArray(indentLevel + 1, toPhp);

  return `[\n${entries.map(mapper).join(',\n')},\n${getIndent(indentLevel)}]`;
};

/**
 * Filters files by extension.
 *
 * @param {string} extension The file extension.
 * @param {{ [x: string]: Object }} files The files object.
 * @return {[string, Object][]} Filtered file entry list. First element is the
 *   the file path, and the second element is any properties for the object.
 */
const filterFiles = (extension, files) =>
  [...Object.entries(files)].filter(([filename]) =>
    filename.endsWith(extension),
  );

/**
 * Converts an a array of parsed libraries to the Drupal structure.
 *
 * @param {Library[]} libraries The list of parsed libraries.
 * @return {Object} The structure.
 */
const asLibraries = (libraries) =>
  Object.fromEntries(
    libraries.map(({ name, files, dependencies }) => {
      const js = filterFiles('.js', files);
      const css = filterFiles('.css', files);

      return [
        name,
        {
          ...(js.length ? { js: Object.fromEntries(js) } : {}),
          ...(css.length ? { css: { theme: Object.fromEntries(css) } } : {}),
          dependencies,
        },
      ];
    }),
  );

/**
 * Writes the include file content from a list of libraries.
 *
 * @param {Library[]} libraries The list of parsed libraries.
 * @return {string} The include file content.
 */
module.exports.writeFile = (libraries) => `<?php

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

return ${toPhp(asLibraries(libraries))};
`;

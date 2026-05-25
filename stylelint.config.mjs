export default {
  plugins: ['stylelint-plugin-use-baseline', 'stylelint-use-logical'],
  extends: ['stylelint-config-standard'],
  rules: {
    // stylelint core
    'alpha-value-notation': null,
    'at-rule-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
        ignoreAtRules: ['import', 'include', 'use', 'forward'],
      },
    ],
    'at-rule-no-unknown': null,
    'color-function-notation': ['modern'],
    'color-function-alias-notation': ['without-alpha'],
    'comment-whitespace-inside': ['always'],
    'comment-empty-line-before': [
      'always',
      {except: ['first-nested'], ignore: ['stylelint-commands']},
    ],
    'custom-property-empty-line-before': [
      'always',
      {ignore: ['after-custom-property', 'first-nested']},
    ],
    'declaration-block-no-duplicate-properties': [true],
    'declaration-block-no-redundant-longhand-properties': [true],
    'declaration-empty-line-before': [
      'always',
      {
        except: ['after-comment'],
        ignore: ['after-comment', 'after-declaration', 'first-nested'],
      },
    ],
    'declaration-property-value-no-unknown': [true],
    'hue-degree-notation': ['number'],
    'length-zero-no-unit': [true],
    'no-descending-specificity': [true],
    'no-empty-source': null,
    'no-duplicate-selectors': [true],
    'property-no-vendor-prefix': [true],
    'rule-empty-line-before': [
      'always',
      {except: ['after-single-line-comment'], ignore: ['after-comment', 'inside-block']},
    ],
    'selector-class-pattern': [
      '^(wp--)?[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$',
      {severity: 'error'}, // allow BEM, multiple hyphens, __, and --
    ],
    'value-keyword-case': ['lower', {ignoreKeywords: ['currentColor']}],

    // baseline
    'plugin/use-baseline': [
      true,
      {
        available: 'widely',
        ignoreProperties: {
          outline: [],
          'transition-behavior': [],
        },
        ignoreSelectors: ['nesting', '/^has/'],
        ignoreAtRules: ['starting-style'],
        severity: 'error',
      },
    ],

    // logical properties
    'csstools/use-logical': ['always'],
  },
};

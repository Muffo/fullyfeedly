module.exports = {
    extends: 'stylelint-config-standard',
    rules: {
        indentation: null,
        'font-family-no-missing-generic-family-keyword': null,
        'shorthand-property-no-redundant-values': null,
        'font-family-name-quotes': 'always-unless-keyword',
        'function-url-quotes': 'always',
        'selector-attribute-quotes': 'always',
        'string-quotes': 'single',
        'at-rule-no-vendor-prefix': true,
        'media-feature-name-no-vendor-prefix': true,
        'property-no-vendor-prefix': true,
        'selector-no-vendor-prefix': true,
        'value-no-vendor-prefix': true,
        'at-rule-no-unknown': true,
        'value-list-comma-newline-after': null,
        'declaration-colon-newline-after': null,
        'declaration-empty-line-before': null,
        'length-zero-no-unit': null,
        'function-url-scheme-whitelist': ['data'],
        'selector-descendant-combinator-no-non-space': null,
        'selector-combinator-space-before': null,
        'no-descending-specificity': null
    }
};

module.exports = {
  // Define all rules inline to avoid ES module dependencies
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // A new feature
        'fix', // A bug fix or update a new feature
        'docs', // Documentation only changes
        'style', // Changes that do not affect the meaning of the code
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'perf', // A code change that improves performance
        'test', // Adding missing tests or correcting existing tests
        'build', // Changes that affect the build system or external dependencies
        'ci', // Changes to our CI configuration files and scripts
        'chore', // Other changes that don't modify src or test files
        'revert', // Reverts a previous commit
        'resolve', // Resolve a issue
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 150],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
    'subject-case': [2, 'always', 'lower-case'],

    // Custom rules using inline plugin
    'header-end-period': [2, 'always'],
    'subject-start-lowercase': [2, 'always'],
    'header-colon-space-format': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'header-end-period': ({ header }) => {
          return [/\.$/.test(header), 'Commit message must end with a dot(.)'];
        },
        'subject-start-lowercase': ({ header }) => {
          // Extract subject after "type: " or "type(scope): "
          const subjectMatch = header.match(
            /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: (.+)$/,
          );
          if (subjectMatch) {
            const subject = subjectMatch[3];
            const firstChar = subject.charAt(0);
            return [firstChar === firstChar.toLowerCase(), 'Subject must start with a lowercase letter'];
          }
          return [true];
        },
        'header-colon-space-format': ({ header }) => {
          // Check for proper format: "type: message" or "type(scope): message" with space after colon
          const pattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .+$/;
          return [pattern.test(header), 'Commit message must follow format "type: message" with space after colon'];
        },
      },
    },
  ],
};

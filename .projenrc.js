const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Biju Joseph',
  authorAddress: 'biju.joseph@semanticbits.com',
  cdkVersion: '2.11.0',
  defaultReleaseBranch: 'main',
  name: 'ez-constructs',
  repositoryUrl: 'https://github.com/SavvyTools/ez-constructs.git',
  license: 'Apache-2.0',
  gitignore: [
    'cdk.context.json',
    'cdk.out/',
    '*.dot',
    '/.idea',
  ],
  releaseToNpm: true,
  devDeps: [
    'cdk-dia',
    '@aws-cdk/assert',
    'aws-cdk-lib',
  ],
  deps: [
  ],
  bundledDeps: [
    'lodash',
    '@types/lodash',
  ],
  scripts: {
    dia: 'npx cdk-dia --target-path assets/images/diagram.png',
  },
});
project.gitignore.exclude('/.idea');
project.synth();
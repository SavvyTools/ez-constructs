import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Biju Joseph',
  authorAddress: 'biju.joseph@semanticbits.com',
  cdkVersion: '2.170.0',
  defaultReleaseBranch: 'main',
  name: 'ez-constructs',
  repositoryUrl: 'https://github.com/SavvyTools/ez-constructs.git',
  license: 'Apache-2.0',
  jsiiVersion: '~5.9.0',
  projenrcTs: true,
  tsconfig: {
    compilerOptions: {
      strictPropertyInitialization: false,
    },
  },
  tsconfigDev: {
    compilerOptions: {
      strictPropertyInitialization: false,
    },
  },
  gitignore: [
    'cdk.context.json',
    'cdk.out/',
    '*.dot',
    '/.idea',
    '/tmp',
    'coverage',
  ],
  releaseToNpm: true,
  publishToPypi: {
    distName: 'ez-constructs',
    module: 'ez_constructs',
  },

  bundledDeps: [
    'lodash',
    '@types/lodash',
    'cdk-nag',
  ],
  devDeps: [
    'cdk-dia',
    '@aws-cdk/assert',
    'aws-cdk-lib',
  ],
  packageName: 'ez-constructs',
  description: 'A collection of high level patterns for creating standard resources in every project',
  scripts: {
    dia: 'npx cdk-dia --target-path assets/images/diagram.png',
  },
});
project.synth();
import { Construct } from 'constructs';

export * from './lib/utils';

/**
 * A marker base class for EzConstructs
 */
export class EzConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }
}


import { Construct } from 'constructs';

/**
 * A marker base class for EzConstructs
 */
export class EzConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }
}


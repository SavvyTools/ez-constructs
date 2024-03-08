import { CfnCluster } from 'aws-cdk-lib/aws-emr';
import { ApplicationConfiguration } from 'aws-cdk-lib/aws-stepfunctions-tasks';

/**
 * A standard spark submit job template.
 */
export interface StandardSparkSubmitJobTemplate {
  /**
   * The name of the job.*required*
   */
  readonly jobName: string;
  /**
   * The S3 URL of the spark application's main file in Amazon S3.
   * A jar file for Scala and Java Spark applications and a Python file for pySpark applications.
   */
  readonly entryPoint: string;
  /**
   * The names of the arguments to pass to the application.
   * The actual argument value should be specified during step funciton execution time.
   */
  readonly entryPointArgumentNames?: string[];
  /**
   * The name of the application's main class,only applicable for Java/Scala Spark applications.
   */
  readonly mainClass: string;
  /**
   * The arguments to pass to the application.
   */
  readonly sparkSubmitParameters?: string;
  /**
   * Any version of overrides to use while provisioning EMR job.
   */
  readonly applicationConfiguration?: ApplicationConfiguration[];

  /**
   * True if monitoring must be enabled. Defaults to true.
   */
  readonly enableMonitoring?: boolean;

  /* emr cluster configuraton */
  readonly clusterConfig? : ClusterConfig;

}


/**
 * Hadoop Node types
 */
export enum NodeType {
  MASTER = 'MASTER',
  CORE = 'CORE',
  TASK = 'TASK'
}


/** Instance configuration */
export interface InstanceConfig {
  readonly name: string;
  readonly targetOnDemandCpacity: number;
  readonly nodeType: NodeType;
  readonly instanceType: string;
  readonly diskSizeInGb?: number;
}

export interface Configuration {
  readonly classification: string;
  properties: { [key:string]: string };
}

export interface ClusterConfig {

  /** The Name of the Cluster */
  readonly clusterName?: string;

  /** EMR release label, which determines the version of open-source application packages installed on the cluster*/
  readonly releaseLabel?: string;

  /** list of applications for Amazon EMR to install, by default Spark , Hadoop and Ganglia will be installed */
  readonly applications?: Array<string>;

  /** The configuration of instances/machines in the cluster */
  readonly instances: Array<InstanceConfig>;

  /** EMR Configurations */
  readonly configurations: Array<Configuration>;
}

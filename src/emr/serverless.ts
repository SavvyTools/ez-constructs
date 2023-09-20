import { Duration } from 'aws-cdk-lib';
import {
  Dashboard, DimensionsMap,
  GaugeWidget, GraphWidget, IMetric,
  MathExpression,
  Metric,
  SingleValueWidget,
  Stats, TextWidget,
} from 'aws-cdk-lib/aws-cloudwatch';
import { IVpc, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { CfnApplication } from 'aws-cdk-lib/aws-emrserverless';
import { CfnApplicationProps } from 'aws-cdk-lib/aws-emrserverless/lib/emrserverless.generated';
import { Construct } from 'constructs';
import { EzConstruct } from '../ez-construct';
import { Utils } from '../lib/utils';

enum WorkerType {
  DRIVER = 'Spark_Driver',
  EXECUTOR = 'Spark_Executor',
  NONE = ''
}

enum AllocationType {
  PRE_INIT= 'PreInitCapacity',
  ON_DEMAND = 'OnDemandCapacity',
  NONE= ''
}

export class SimpleServerlessApplication extends EzConstruct {

  /** @internal */ private _vpc?: IVpc;
  /** @internal */ private _applicationName: string = '';
  /** @internal */ private _privateSubnetIds: string[] = [];
  /** @internal */ private _securityGroup?: SecurityGroup;
  /** @internal */ private _application?: CfnApplication;

  private readonly _scope: Construct;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this._scope = scope;
  }

  get application(): CfnApplication | undefined {
    return this._application;
  }

  public name(name: string): SimpleServerlessApplication {
    this._applicationName = name;
    return this;
  }

  public vpc(v: IVpc | string): SimpleServerlessApplication {
    // obtain the vpc
    if (typeof v === 'string') {
      this._vpc = Vpc.fromLookup(this._scope, 'ExistingVpc', { vpcId: v });
    } else {
      this._vpc = v;
    }

    // obtain the private subnet ids
    this._privateSubnetIds = this._vpc.privateSubnets.map(s => s.subnetId);
    this._securityGroup = new SecurityGroup(this._scope, 'EmrServerlessSecurityGroup', {
      vpc: this._vpc,
    });

    return this;
  }

  private createMathExpression(title: string, expression: string, usingMetrics:any = {}, color:string = '#D01161FF'): IMetric {
    return new MathExpression({
      expression: expression,
      label: title,
      usingMetrics: usingMetrics,
      color: color,
    });
  }
  private createMetric(metricName: string, workerType: WorkerType, allocationType:AllocationType, label='', includeSumStats = false, color = '#18EC9BFF') : Metric {
    let dim:DimensionsMap = { ApplicationId: this._application?.attrApplicationId || '' };
    if (workerType) dim.WorkerType = workerType.toString();
    if (allocationType) dim.CapacityAllocationType = allocationType.toString();

    let m = new Metric({
      metricName: metricName,
      namespace: 'AWS/EMRServerless',
      dimensionsMap: dim,
      color: color,
    });


    if (includeSumStats) {
      m = m.with({
        statistic: Stats.SUM,
        period: Duration.minutes(1),
      });
    }
    if (label) {
      m = m.with({
        label: label,
      });
    }

    return m;
  }
  private createTextWidget(markdown: string, width = 24, height = 2): TextWidget {
    return new TextWidget({
      markdown: markdown,
      height: height,
      width: width,
    });
  }
  private createSingleValueWidget(title:string, metrics:IMetric[], width = 24, height=6): SingleValueWidget {
    return new SingleValueWidget({
      title: title,
      width: width,
      height: height,
      sparkline: true,
      metrics: metrics,
    });
  }
  private createGraphWidget(title: string, metrics: IMetric[], width = 12): GraphWidget {
    return new GraphWidget({
      title: title,
      period: Duration.minutes(1),
      width: width,
      stacked: true,
      left: metrics,
    });
  }
  private createGuageWidget(title: string, metrics: IMetric[], width = 12): GaugeWidget {
    return new GaugeWidget({
      title: title,
      period: Duration.minutes(1),
      width: width,
      metrics: metrics,
    });
  }

  private createDashboard():Dashboard {
    let dashboard = new Dashboard(this._scope, 'Dashboard', {
      dashboardName: `${Utils.kebabCase(this._applicationName)}-dashboard`,
    });

    let preInitDriverMetric = this.createMetric('RunningWorkerCount', WorkerType.DRIVER, AllocationType.PRE_INIT);
    let preInitExecutorMetric = this.createMetric('RunningWorkerCount', WorkerType.EXECUTOR, AllocationType.PRE_INIT);

    let preInitDriverRunningMetric = this.createMetric('RunningWorkerCount', WorkerType.DRIVER, AllocationType.PRE_INIT, 'Pre-Initialized', true);
    let preInitExecutorRunningMetric = this.createMetric('RunningWorkerCount', WorkerType.EXECUTOR, AllocationType.PRE_INIT, 'Pre-Initialized', true);

    let onDemandDriverRunningMetric = this.createMetric('RunningWorkerCount', WorkerType.DRIVER, AllocationType.ON_DEMAND, 'OnDemand', true);
    let onDemandExecutorRunningMetric = this.createMetric('RunningWorkerCount', WorkerType.EXECUTOR, AllocationType.ON_DEMAND, 'OnDemand', true);

    let idleWorkerMetric = this.createMetric('IdleWorkerCount', WorkerType.NONE, AllocationType.NONE, '', true);

    let preInitUtilizationExpression = this.createMathExpression('Pre-Init Worker Utilization %', '100*((m1+m2)/(m1+m2+m3))', {
      m1: preInitDriverMetric,
      m2: preInitExecutorMetric,
      m3: idleWorkerMetric,
    });

    let widget1 = this.createGuageWidget( 'Pre-Initialized Capacity Worker Utilization %', [preInitUtilizationExpression]);
    let widget2 = this.createSingleValueWidget('Running Drivers', [preInitDriverRunningMetric, onDemandDriverRunningMetric]);
    dashboard.addWidgets(widget1, widget2);

    let preInitRunningExpression = this.createMathExpression('Pre-Initialized', 'm1+m2+m5', {
      m1: preInitDriverRunningMetric,
      m2: preInitExecutorRunningMetric,
      m5: idleWorkerMetric,
    });
    let preInitOnDemandRunningExpression = this.createMathExpression('OnDemand', 'm3+m4', {
      m3: onDemandDriverRunningMetric,
      m4: onDemandExecutorRunningMetric,
    }, '#1124d0');

    let widget3 = this.createSingleValueWidget('Available Workers', [preInitRunningExpression, preInitOnDemandRunningExpression], 12);
    let widget4 = this.createSingleValueWidget('Running Executors', [preInitExecutorRunningMetric, onDemandExecutorRunningMetric], 12);
    dashboard.addWidgets(widget3, widget4);

    let jobStates = [
      'SubmittedJobs',
      'PendingJobs',
      'ScheduledJobs',
      'RunningJobs',
      'SuccessJobs',
      'FailedJobs',
      'CancellingJobs',
      'CancelledJobs',
    ];

    let jobStateMetrics = jobStates.map(name => this.createMetric(name, WorkerType.NONE, AllocationType.NONE, name, true));
    dashboard.addWidgets(this.createSingleValueWidget('Job Runs', jobStateMetrics));

    let label = `Application Metrics\n---\nApplication metrics shows the capacity used by application **(${this._application?.logicalId})**.`;
    dashboard.addWidgets(this.createTextWidget(label));

    const appGraphWidgets = ['CPUAllocated', 'MemoryAllocated', 'StorageAllocated']
      .map(name =>
        this.createGraphWidget(name, [
          this.createMathExpression('Pre-Initialized', 'm1+m2', {
            m1: this.createMetric(name, WorkerType.DRIVER, AllocationType.PRE_INIT, 'Pre-Initialized Spark Driver', true),
            m2: this.createMetric(name, WorkerType.EXECUTOR, AllocationType.PRE_INIT, 'Pre-Initialized Spark Executor', true),
          }),

          this.createMathExpression('OnDemand', 'm3+m4', {
            m3: this.createMetric(name, WorkerType.DRIVER, AllocationType.ON_DEMAND, 'OnDemand Spark Driver', true),
            m4: this.createMetric(name, WorkerType.EXECUTOR, AllocationType.ON_DEMAND, 'OnDemand Spark Executor', true),
          }, '#ff7f0e'),

        ]));

    dashboard.addWidgets(
      this.createGraphWidget('Running Workers', [
        this.createMathExpression('Pre-Initialized', 'm1+m2+m5', {
          m1: preInitDriverRunningMetric,
          m2: preInitExecutorRunningMetric,
          m5: idleWorkerMetric,
        }),
        this.createMathExpression('OnDemand', 'm3+m4', {
          m3: onDemandDriverRunningMetric,
          m4: onDemandExecutorRunningMetric,
        }, '#ff7f0e'),
      ]),
      appGraphWidgets[0],
    );
    dashboard.addWidgets(...appGraphWidgets.slice(1));

    label = 'Pre-Initialized Capacity Metrics\n---\nShows you the Pre-Initialized Capacity metrics for an Application.';
    dashboard.addWidgets(this.createTextWidget(label));

    dashboard.addWidgets(
      this.createGraphWidget('Pre-Initialized Capacity: Total Workers', [
        this.createMathExpression('Pre-Initialized Total Workers', 'm1+m2+m3', {
          m1: preInitDriverRunningMetric,
          m2: preInitExecutorRunningMetric,
          m3: idleWorkerMetric,
        }),
      ]),
      this.createGraphWidget('Pre-Initialized Capacity: Worker Utilization %', [
        this.createMathExpression('Pre-Initialized Capacity Worker Utilization %', '100*((m1+m2)/(m1+m2+m3))', {
          m1: preInitDriverRunningMetric,
          m2: preInitExecutorRunningMetric,
          m3: idleWorkerMetric,
        }),
      ]),
    );

    dashboard.addWidgets(this.createGraphWidget('Pre-Initialized Capacity: Idle Workers', [idleWorkerMetric]));

    label = 'Spark Driver Metrics\n---\nmetrics show you the capacity used by Spark Drivers for Pre-Initialized and On-Demand capacity pools.';
    dashboard.addWidgets(this.createTextWidget(label));
    dashboard.addWidgets(
      this.createGraphWidget('Running Drivers Count', [
        this.createMetric('RunningWorkerCount', WorkerType.DRIVER, AllocationType.PRE_INIT, 'Pre-Initialized', true),
        this.createMetric('RunningWorkerCount', WorkerType.DRIVER, AllocationType.ON_DEMAND, 'OnDemand', true),
      ]),
      this.createGraphWidget('CPU Allocated', [
        this.createMetric('CPUAllocated', WorkerType.DRIVER, AllocationType.PRE_INIT, 'Pre-Initialized', true),
        this.createMetric('CPUAllocated', WorkerType.DRIVER, AllocationType.ON_DEMAND, 'OnDemand', true),
      ]),
    );
    dashboard.addWidgets(
      this.createGraphWidget('Memory Allocated', [
        this.createMetric('MemoryAllocated', WorkerType.DRIVER, AllocationType.PRE_INIT, 'Pre-Initialized', true),
        this.createMetric('MemoryAllocated', WorkerType.DRIVER, AllocationType.ON_DEMAND, 'OnDemand', true),
      ]),
      this.createGraphWidget('Storage Allocated', [
        this.createMetric('StorageAllocated', WorkerType.DRIVER, AllocationType.PRE_INIT, 'Pre-Initialized', true),
        this.createMetric('StorageAllocated', WorkerType.DRIVER, AllocationType.ON_DEMAND, 'OnDemand', true),
      ]),
    );


    label = 'Spark Executor Metrics\n---\nmetrics show you the capacity used by Spark Executors for Pre-Initialized and On-Demand capacity pools.';
    dashboard.addWidgets(this.createTextWidget(label));
    dashboard.addWidgets(
      this.createGraphWidget('Running Drivers Count', [
        this.createMetric('RunningWorkerCount', WorkerType.EXECUTOR, AllocationType.PRE_INIT, 'Pre-Initialized', true),
        this.createMetric('RunningWorkerCount', WorkerType.EXECUTOR, AllocationType.ON_DEMAND, 'OnDemand', true),
      ]),
      this.createGraphWidget('CPU Allocated', [
        this.createMetric('CPUAllocated', WorkerType.EXECUTOR, AllocationType.PRE_INIT, 'Pre-Initialized', true),
        this.createMetric('CPUAllocated', WorkerType.EXECUTOR, AllocationType.ON_DEMAND, 'OnDemand', true),
      ]),
    );
    dashboard.addWidgets(
      this.createGraphWidget('Memory Allocated', [
        this.createMetric('MemoryAllocated', WorkerType.EXECUTOR, AllocationType.PRE_INIT, 'Pre-Initialized', true),
        this.createMetric('MemoryAllocated', WorkerType.EXECUTOR, AllocationType.ON_DEMAND, 'OnDemand', true),
      ]),
      this.createGraphWidget('Storage Allocated', [
        this.createMetric('StorageAllocated', WorkerType.EXECUTOR, AllocationType.PRE_INIT, 'Pre-Initialized', true),
        this.createMetric('StorageAllocated', WorkerType.EXECUTOR, AllocationType.ON_DEMAND, 'OnDemand', true),
      ]),
    );

    const jobMetricsMarkdown = 'Job Metrics\n---\nJob metrics shows you the aggregate number of jobs in each job state.';
    dashboard.addWidgets(this.createTextWidget(jobMetricsMarkdown));
    dashboard.addWidgets(
      this.createGraphWidget('Running Jobs', [
        this.createMetric('RunningJobs', WorkerType.NONE, AllocationType.NONE, '', true),
      ]),
      this.createGraphWidget('Successful Jobs', [
        this.createMetric('SuccessJobs', WorkerType.NONE, AllocationType.NONE, '', true, '#2ca02c'),
      ]),
    );
    dashboard.addWidgets(
      this.createGraphWidget('Failed Jobs', [
        this.createMetric('FailedJobs', WorkerType.NONE, AllocationType.NONE, '', true, '#d62728'),
      ]),
      this.createGraphWidget('Cancelled Jobs', [
        this.createMetric('CancelledJobs', WorkerType.NONE, AllocationType.NONE, '', true, '#c5b0d5'),
      ]),
    );

    return dashboard;
  }

  public assemble(props?: CfnApplicationProps): SimpleServerlessApplication {
    let newProps = Object.assign({}, this.defaultProps(), props || {});
    this._application = new CfnApplication(this._scope, 'DefaultServerlessApplication', newProps);
    this.createDashboard();
    return this;
  }

  /**
   * Will create the default properties for the EMR Serverless Application
   * @private
   */
  private defaultProps(): CfnApplicationProps {

    return {
      releaseLabel: 'emr-6.12.0',
      name: this._applicationName,
      type: 'SPARK',
      maximumCapacity: {
        cpu: '960vCPU',
        memory: '7680gb',
        disk: '30000gb',
      },
      networkConfiguration: {
        subnetIds: this._privateSubnetIds,
        securityGroupIds: [this._securityGroup?.securityGroupId || ''],
      },
    };

  }

}
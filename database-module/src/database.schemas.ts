
import * as mongoose from 'mongoose';

export const TenantSchema = new mongoose.Schema({
    name: { type: String },
    id: { type: String, unique: true },
    address: String,
    paymentDetails: mongoose.Schema.Types.Mixed,
    phoneNumber: { type: String, required: true },
    businessType: String,
    status: { type: String, enum: ['Active', 'NotActive'], default: 'Active' },
    subscriptionPlan: String,
    dataConnectionCount: {
        type: Number, default: 0
    }
});

TenantSchema.index({ id: 1, name: 1 });

export const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    id: { type: String, unique: true, required: true },
    role: { type: String, enum: ['Admin', 'TenantAdmin', 'Modeller', 'Visualizer', 'Consumer'], required: true },
    tenantId: { type: String, required: true },
    name: { firstName: String, lastName: String },
    status: { type: String, enum: ['Active', 'NotActive'], default: 'Active' },
    userLanguage: { type: String, default: 'en-us' },
    userTimeZone: { type: String, required: true },
    passwordStatus: { type: String, enum: ['Valid', 'Reset'], default: 'Valid' },
    lastLoginTime: Number,
    lastLoginSuccessful: Boolean,
});
UserSchema.index({ id: 1, username: 1 });

UserSchema.index({ 'name.firstName': 'text', 'name.lastName': 'text' });

export const NodeSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    type: { type: String, required: true },
    server: { type: String, required: true },
    port: Number,
    config: mongoose.Schema.Types.Mixed,
    lastSelected: Number,
    lastAliveTimeStamp: Number,
    status: { type: String, enum: ['online', 'offline'], default: 'online' },
});
NodeSchema.index({ id: 1 });

export const InvitationSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted'], default: 'Pending' },
    role: { type: String, enum: ['Admin', 'TenantAdmin', 'Modeller', 'Visualizer', 'Consumer'], required: true },
    firstName: { type: String},
    lastName: { type: String },
    invitationDate: Number,
});
InvitationSchema.index({ id: 1 });

InvitationSchema.index({ email: 1, tenantId: 1 }, { name: 'UniqueInvitationPerTenantPerEmail' });

export const DataSourceConnectionSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    userId: { type: String, required: true },
    tenantId: { type: String, required: true },
    maxMetadataConnectionCount: { type: Number, default: 2 },
    maxDataConnectionCount: { type: Number, default: 8 },
    metadataConcurrency: { type: Number, default: 1 },
    dataConcurrency: { type: Number, default: 2 },
    metadataConnectionCount: {
        type: Number, default: 0 
    },
    dataConnectionCount: {
        type: Number, default: 0
    },
    maxAcquireConnectionRetry: { type: Number, default: 5 },
    acquireConnectionSleepDuration: { type: Number, default: 1000 },
    connectionType: { type: String, required: true, enum: ['Oracle', 'Postgres', 'MySQL', 'MariaDB', 'MSSQL'] },
    connectionInfo: {
        serverName: String,
        serverPort: Number,
        serviceName: String,
        connectionProperties: [{
            name: String,
            value: String,
        }],
        username: String,
        password: String,
        connectionTimeout: Number,
    },
    lastAccess: Number,
    creationDate: Number

});

DataSourceConnectionSchema.index({ id: 1, username: 1 });

DataSourceConnectionSchema.index({
    'name': 'text', 'connectionType': 'text', 'connectionInfo.serverName': 'text'
    , 'connectionInfo.serviceName': 'text', 'connectionInfo.username': 'text',
});

DataSourceConnectionSchema.index({ tenantId: 1, userId: 1, name: 1 }, { name: 'UniqueConnectionPerTenantPerUser', unique: true });


export const TaskSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    taskType: { type: String, required: true },
    schedulingType: {
        type: String,
        required: true,
        enum: ['every', 'now', 'schedule', 'repeat'],
    },
    schedulingString: { type: String },
    tenantId: { type: String, required: true },
    agendaJobId: { type: String },
    status: {
        type: String,
        required: true,
        enum: ['scheduled', 'completed', 'failed', 'started', 'cancelled'],
    },
});
TaskSchema.index({ id: 1 });


export const ClueModelSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    userId: { type: String, required: true },
    tenantId: { type: String, required: true },
    modelType: { type: String, required: true, enum: ['public', 'private'], default: 'public' },
    datasources: [{
        datasourceType: { type: String, required: true, enum: ['DatabaseConnection', 'Dataset'], default: 'DatabaseConnection' },
        datasourceId: { type: String, required: true }
    }],
    lastAccess: { type: Number },
    showJoinsOnGraph: { type: Boolean, default: false },
    hideGraph: { type: Boolean, default: false },
    hideDataPreview: { type: Boolean, default: false },
    hidePropertySheet: { type: Boolean, default: false },
    creationDate: Number
});

ClueModelSchema.index({ id: 1, name: 1 });

export const ClueModelObjectSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    nameInDatasource: { type: String },
    userId: { type: String, required: true },
    tenantId: { type: String, required: true },
    dataSourceConnectionId: { type: String, required: true },
    schemata: { type: String },
    type: { type: String, enum: ['TABLE', 'VIEW', 'FILTER', 'JOIN'], default: 'TABLE' },
    source: { type: String, enum: ['Database', 'Model'], default: 'Database' },
    clueModelId: { type: String, required: true },
    datasetDatafileId: { type: String },
    tableId: { type: String },
    modelObjectItems: [{
        modelObjectItemId: { type: String, unique: true },
        nameInDatasource: { type: String },
        columnName: { type: String },
        prettyName: { type: String },
        dataTypeInDataSource: { type: String },
        sourceModelObjectId: { type: String },
        sourceModelObjectItemId: { type: String },
        dataLength: { type: Number },
        precisionInDataSource: { type: Number },
        decimalPoints: { type: Number },
        usage: { type: String, enum: ['Fact', 'Dimension'], default: 'Dimension' },
        usageType: { type: String, enum: ['Number', 'Boolean', 'Text', 'Date', 'Timestamp', 'Time'], default: 'Text' },
        defaultAggregation: { type: String, enum: ['Sum', 'Avg', 'Count', 'Min', 'Max', 'Count Distinct', 'None'], default: 'Count' },
        defaultFormat: { type: String, default: '' },
        isPrimaryKey: { type: Boolean, default: false },
        isForeignKey: { type: Boolean, default: false },
        references: String,
        sourceSchema: { type: String, default: '' },
        sourceTable: { type: String, default: '' },
        foreignTableSchema: { type: String, default: '' },
        foreignTableName: { type: String, default: '' },
        foreignTableColumnName: { type: String, default: '' },
        constraintType: { type: String, default: '' },
        defaultSort: { type: String, default: 'ASC' },
    }],

    joinPath: [
        {
            connectionId: { type: String },
            joinConditions: [{
                left: { type: String },
                right: { type: String },
            }],
        },
    ],
    filterExpression: [{ type: String }],
});

ClueModelObjectSchema.index({ id: 1, name: 1 });

export const MetadataImportTaskTrackerSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    trackingId: { type: String },
    clueModelId: { type: String, required: true },
    userId: { type: String, required: true },
    tenantId: { type: String, required: true },
    startTimestamp: Number,
    schemata: { type: String, required: true },
    objectName: { type: String, required: true },
    dataSourceConnectionId: { type: String, required: true },
    importTimestamp: Number,
    status: { type: String, enum: ['Pending', 'In Progress', 'Successful', 'Error'], default: 'Pending' },
    errorMessage: String,
});

MetadataImportTaskTrackerSchema.index({ id: 1, trackingId: 1, clueModelId: 1, dataSourceConnectionId: 1 });

export const SubscriptionPlanSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    planName: { type: String, required: true },
    planSubTitle: { type: String, required: true },
    planDescription: { type: String, required: true },
    planStripeCode: { type: String, unique: true, required: true },
    planPrice: { type: String, required: true },
    planMarketingStatement: { type: String, required: true },
    status: { type: String, enum: ['Active', 'NotActive'], default: 'Active' },
    lastUpdate: { type: Number },
    concurrency: { type : Number , default : 5},
    storageLimit: { type: Number, default: 200}
});

export const VisualizationBookSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    clueModelId: { type: String, required: true },
    userId: { type: String, required: true },
    tenantId: { type: String, required: true },
    lastUpdate: { type: Number },
    creationDate: Number
});

export const VisualizationPageSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    userId: { type: String, required: true },
    tenantId: { type: String, required: true },
    title: { type: String },
    subTitle: { type: String },
    lastUpdate: { type: Number },
    visualizationBookId: { type: String, required: true },
    visualizations: [
        {
            id: { type: String, required: true },
            title: mongoose.Schema.Types.Mixed,
            subTitle: mongoose.Schema.Types.Mixed,
            description: mongoose.Schema.Types.Mixed,
            xAxisSelection: [{ id: String, text: String, style: mongoose.Schema.Types.Mixed, usage: String, usageType: String, defaultAggregation: String, defaultFormat: String }],
            yAxisSelection: [{ id: String, text: String, style: mongoose.Schema.Types.Mixed, usage: String, usageType: String, defaultAggregation: String, defaultFormat: String }],
            repeatAxisSelection: [{ id: String, text: String, style: mongoose.Schema.Types.Mixed, usage: String, usageType: String, defaultAggregation: String, defaultFormat: String }],
            polarAxisSelection: [{ id: String, text: String, style: mongoose.Schema.Types.Mixed, usage: String, usageType: String, defaultAggregation: String, defaultFormat: String }],
            polarAngleSelection: [{ id: String, text: String, style: mongoose.Schema.Types.Mixed, usage: String, usageType: String, defaultAggregation: String, defaultFormat: String }],
            chartType: {
                type: String, enum: ['AreaChart', 'LineChart', 'BarChart', 'PieChart',
                    'ComposedChart', 'RadarChart', 'RadialBarChart', 'ScatterChart', 'FunnelChart', 'TreeMap', 'SankeyChart'], default: 'BarChart', required: true
            },
            chartObject: {
                type: String, enum: ['Area', 'Bar', 'Line', 'Pie'],
                default: 'Bar'
            },
            vizQuery: mongoose.Schema.Types.Mixed,
            layout: {
                x: { type: Number, default: 0 },
                y: { type: Number, default: 0 },
                w: { type: Number, default: 4 },
                h: { type: Number, default: 8 },
                minW: { type: Number, default: 5 },
                minH: { type: Number, default: 4 },
            }
        }
    ],
    layout:
    {
        cols: { type: Number, default: 12, required: true },
        rowHeight: { type: Number, default: 45, required: true },
        className: { type: String },
        autoSize: { type: Boolean, default: true },
        compactType: { type: String, default: 'horizontal', enum: ['horizontal', 'vertifcal'], required: true },
        marginx: { type: Number, default: 10 },
        marginy: { type: Number, default: 10 },
        containerPaddingx: { type: Number, default: 10 },
        containerPaddingy: { type: Number, default: 10 },
        isDraggable: { type: Boolean, default: true },
        isResizable: { type: Boolean, default: true },
        preventCollision: { type: Boolean, default: false },
    }

});

export const TenantDatasetDatabaseSchema = new mongoose.Schema({
    id: { type: String, required: true },
    tenantId: { type: String, required: true },
    tenantCert: { type: String },
    tenantKey: { type: String },
    tenantDatabaseName: { type: String },
});



export const DatasetSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    datasetName: { type: String },
    datasetDescription: String,
    userId: { type: String, required: true },
    tenantId: { type: String, required: true },
    skeletonModelId: { type: String },
    lastAccess: { type: Number },
    creationDate: Number
});
DatasetSchema.index({ datasetName: 'text', userId: 'text', tenantId: 'text' });

export const DatasetDataFileSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    datasetId: { type: String, required: true },
    fileName: { type: String },
    fileType: { type: String },
    fid: { type: String },
    volumeId: { type: String },
    status: { type: String, enum: ['upload-pending', 'upload-failed', 'import-ready' , 'import-failed', 'import-complete' , 'import-partially-failed'], default: 'upload-pending' }, 
    analyzerStatus: { type: String, enum: ['in-progress', 'failed', 'complete', 'partially-failed'] }, // for exel analysis
    dfsUrl: { type: String }, // For excel upload, this will be the original excel file URL
    dfsPublicUrl: { type: String },
    fileExtension: { type: String },
    dfsFileStatus: { type: String, enum: ['available', 'auto-cleaned'] }, // for original excel , should not be used for csv
    fileSize: { type: Number },
    fileSizeInDFS: { type: Number },
    creationDate: { type : Number},
    errorMessage: { type: String },
    tables : [{
        id: { type: String, unique: true ,  sparse: true   },
        tableName: { type: String},
        prettyName: { type: String },
        fileName: { type: String },
        fid: { type: String }, // for generated CSV from excel case
        volumeId: { type: String }, // for generated CSV from excel case
        status: { type: String, enum: ['upload-pending', 'upload-failed','import-ready' , 'import-failed', 'import-complete'], default: 'upload-pending' }, 
        errorMessage: { type: String },
        dfsUrl: { type: String }, // for generated CSV from excel case
        dfsPublicUrl: { type: String }, // for generated CSV from excel case
        fileExtension: { type: String }, // for generated CSV from excel case
        skipHeader: { type: Boolean },
        sampleSize: { type: Number },
        numberOfLines: { type: Number },
        electedDelimiter: { type: String },
        strictQuote: { type: String, enum: ['OFF', 'ON'], default: 'OFF' },
        electedTableName: { type: String },
        datafileModelObjectId: { type: String },
        analyzerStatus: { type: String, enum: ['in-progress', 'failed', 'complete'] }, // for CSV's created by excel
        jobId: { type: String },
        modelObjectId: { type: String },
        dfsFileStatus: { type: String, enum: ['available', 'auto-cleaned'] }, // this state for csv and for csvs created for excel tables.
        fileSize: { type: Number },
        fileSizeInDFS: { type: Number },
        importError: { type: String},
        creationDate: { type : Number},
        tableColumns: [
            {
                id: { type: String, unique: true ,  sparse: true },
                electedHeaderName: { type: String },
                electedType: { type: String },
                columnIndex: { type: Number },
                columnPrettyName: { type: String },
                modelObjectItemId: { type: String}
            }
        ]
    }]
});

export const ClueSettingsSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    datasetDatabaseCA: { type: String },
    datasetDatabaseCACert: { type: String },
    datasetDatabaseRootUserCert: { type: String },
    datasetDatabaseRootUserKey: { type: String },
    datasetDatabaseDSUserCert: { type: String },
    datasetDatabaseDSUserKey: { type: String },
    installationType: { type: String , default : 'Multi-tenant' , enum: ['Multi-tenant' , 'Dedicated Cloud' , 'Enterprise' , 'SDK']},
    schemaMajorVersion: Number,
    schemaMinorVersion: Number,
    maxAcquireDatasetStoreConnectionRetry: { type: Number, default: 5 },
    acquireDatasetStoreConnectionSleepDuration: { type: Number, default: 1000 },

});



export interface VisualizationBook extends mongoose.Document {
    id: string;
    name: string;
    description: string;
    clueModelId: string;
    userId: string;
    tenantId: string;
    lastUpdate: number;
    creationDate: number;
}

export interface VisualizationPage extends mongoose.Document {
    id: string;
    name: string;
    title: string;
    subTitle: string;
    userId: string;
    tenantId: string;
    visualizationBookId: string;
    lastUpdate: number;
    visualizations: [
        {
            id: string;
            title: any,
            subTitle: any,
            description: any,
            xAxisSelection: [{ id: string, text: string, style: any, usage: string, usageType: string, defaultAggregation: string, defaultFormat: string }],
            yAxisSelection: [{ id: string, text: string, style: any, usage: string, usageType: string, defaultAggregation: string, defaultFormat: string }],
            repeatAxisSelection: [{ id: string, text: string, style: any, usage: string, usageType: string, defaultAggregation: string, defaultFormat: string }],
            polarAxisSelection: [{ id: string, text: string, style: any, usage: string, usageType: string, defaultAggregation: string, defaultFormat: string }],
            polarAngleSelection: [{ id: string, text: string, style: any, usage: string, usageType: string, defaultAggregation: string, defaultFormat: string }],
            chartType: string;
            chartObject: string;
            vizQuery: any;
            layout: {
                x: number;
                y: number;
                w: number;
                h: number;
                minW: number;
                minH: number;
            }
        }
    ],
    layout:
    {
        cols: number;
        rowHeight: number;
        className: string;
        autoSize: boolean;
        compactType: string;
        marginx: number;
        marginy: number;
        containerPaddingx: number;
        containerPaddingy: number;
        isDraggable: boolean;
        isResizable: boolean;
        preventCollision: boolean;
    }
}


export interface Tenant extends mongoose.Document {
    name: string;
    id: string;
    address: string;
    businessType: string;
    paymentDetails: any;
    phoneNumber: string;
    status: string;
    subscriptionPlan: string;
    dataConnectionCount: number;
}

export interface User extends mongoose.Document {
    username: string;
    password: string;
    id: string;
    role: string;
    tenantId: string;
    name: { firstName: string, lastName: string };
    status: string;
    userLanguage: string;
    userTimeZone: string;
    passwordStatus: string;
    lastLoginTime: number;
    lastLoginSuccessful: boolean;

}

export interface Node extends mongoose.Document {
    id: string;
    type: string;
    server: string;
    port: number;
    config: any;
    lastSelected: number;
    lastAliveTimeStamp: number;
    status: string; // Online, Offline
}

export interface Invitation extends mongoose.Document {
    id: string;
    email: string;
    tenantId: string;
    status: string;
    role: string;
    firstName: string;
    lastName: string;
    invitationDate: number;
}


export interface DataSourceConnection extends mongoose.Document {
    id: string;
    name: string;
    userId: string;
    tenantId: string;
    metadataConnectionCount: number;
    dataConnectionCount: number;
    maxMetadataConnectionCount: number;
    maxDataConnectionCount: number;
    metadataConcurrency: number;
    dataConcurrency: number;
    maxAcquireConnectionRetry: number;
    acquireConnectionSleepDuration: number;
    connectionType: string;
    connectionInfo: {
        serverName: string;
        serverPort: number;
        serviceName: string;
        connectionProperties: [{
            name: string;
            value: string;
        }];
        username: string;
        password: string;
        connectionTimeout: number;
    };
    lastAccess: number;
    creationDate: number;
}

export interface TaskEntry extends mongoose.Document {
    id: string;
    taskType: string;
    schedulingType: string;
    schedulingString: string;
    tenantId: string;
    agendaJobId: string;
    status: string;
}

export interface ClueModel extends mongoose.Document {
    id: string;
    name: string;
    userId: string;
    tenantId: string;
    modelType: string;
    datasources: [{
        datasourceType: string,
        datasourceId: string,
    }];
    lastAccess: number;
    showJoinsOnGraph: boolean;
    hideGraph: boolean;
    hideDataPreview: boolean;
    hidePropertySheet: boolean;
    creationDate: number;

}

export interface ClueModelObject extends mongoose.Document {
    id: string;
    name: string;
    nameInDatasource: string;
    userId: string;
    tenantId: string;
    dataSourceConnectionId: string;
    schemata: string;
    type: string;
    source: string;
    clueModelId: string;
    datasetDatafileId: string;
    tableId: string;
    modelObjectItems: [{
        modelObjectItemId: string;
        nameInDatasource: string;
        columnName: string;
        prettyName: string;
        dataTypeInDataSource: string;
        sourceModelObjectId: string;
        sourceModelObjectItemId: string;
        dataLength: number;
        precisionInDataSource: number;
        decimalPoints: number;
        usage: string;
        usageType: string;
        defaultAggregation: string;
        defaultFormat: string;
        isPrimaryKey: boolean;
        isForeignKey: boolean;
        references: string;
        sourceSchema: string;
        sourceTable: string;
        foreignTableSchema: string;
        foreignTableName: string;
        foreignTableColumnName: string;
        constraintType: string,
        defaultSort: string;
    }];
    joinPath: [
        {
            connectionId: { type: string },
            joinConditions: [{
                left: { type: string },
                right: { type: string },
            }],
        }
    ];
    filterExpression: [{ type: string }];
}
export interface MetadataImportTaskTracker extends mongoose.Document {
    id: string;
    trackingId: string;
    clueModelId: string;
    userId: string;
    tenantId: string;
    startTimestamp: number;
    schemata: string;
    objectName: string;
    dataSourceConnectionId: string;
    importTimestamp: number;
    status: string;
    errorMessage: string;
}

export interface SubscriptionPlan extends mongoose.Document {
    id: string;
    planName: string;
    planSubTitle: string;
    planDescription: string;
    planStripeCode: string;
    planPrice: string;
    planMarketingStatement: string;
    status: string;
    lastUpdate: number;
    concurrency: number;
    storageLimit: number;
}

export interface Dataset extends mongoose.Document {
    id: string;
    datasetName: string;
    datasetDescription: string;
    userId: string;
    tenantId: string;
    skeletonModelId: string;
    lastAccess: number;
    creationDate: number;

}

export interface DatasetDataFile extends mongoose.Document {
    id: string;
    datasetId: string;
    fileName: string;
    fileType: string;
    fid: string;
    volumeId: string;
    status: string;
    analyzerStatus: string;
    dfsUrl: string;
    dfsPublicUrl: string;
    fileExtension: string;
    dfsFileStatus: string;
    fileSize: number;
    fileSizeInDFS: number;
    creationDate: number;
    errorMessage: string;
    tables : [{
        id: string;
        tableName: string;
        prettyName: string;
        fileName: string;
        fid: string;
        volumeId: string;
        status: string;
        errorMessage: string;
        dfsUrl: string;
        dfsPublicUrl: string;
        fileExtension: string;
        skipHeader: boolean;
        sampleSize: number;
        numberOfLines: number;
        electedDelimiter: string;
        strictQuote: string;
        electedTableName: string;
        datafileModelObjectId: string;
        analyzerStatus: string;
        jobId: string;
        modelObjectId: string;
        dfsFileStatus: string;
        fileSize: number;
        fileSizeInDFS: number;
        importError: string;
        creationDate: number;
        tableColumns: [
            {
                id: string;
                electedHeaderName: string;
                electedType: string;
                columnIndex: number;
                columnPrettyName: string;
                modelObjectItemId: string;
            }
        ]
    }]
}


export interface TenantDatasetDatabase extends mongoose.Document {
    id: string;
    tenantId: string;
    tenantCert: string;
    tenantKey: string;
    tenantDatabaseName: string;
}

export interface ClueSettings extends mongoose.Document {
    id: string;
    datasetDatabaseCA: string;
    datasetDatabaseCACert: string;
    datasetDatabaseRootUserCert: string;
    datasetDatabaseRootUserKey: string;
    datasetDatabaseDSUserCert: string;
    datasetDatabaseDSUserKey: string;
    installationType: string;
    schemaMajorVersion: number;
    schemaMinorVersion: number;
    maxAcquireDatasetStoreConnectionRetry: number;
    acquireDatasetStoreConnectionSleepDuration: number;
}

// export type ClueModelDTO = Omit<ClueModel, 'id'|'userId'|'tenantId'>;




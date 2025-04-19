import { AbstractQueryGenerator } from './generator.base';


export class CockroachQueryGeneratorImpl extends AbstractQueryGenerator {
    protected buildQueryLimitsInternal() {
        if (this.generatorState.queryDefinition.rowLimit && this.generatorState.queryDefinition.rowLimit !== 0) {
            this.generatorState.limitsClause = 'LIMIT ' + this.generatorState.queryDefinition.rowLimit;
        }
    }

    composeQuery() {
        super.composeQuery();
        if (this.generatorState.queryDefinition.rowLimit && this.generatorState.queryDefinition.rowLimit !== 0) {
            this.generatorState.query += ' ' + this.generatorState.limitsClause;
        }
    }

    protected getDbName(): string {
        return 'Cockroach';
    }

}
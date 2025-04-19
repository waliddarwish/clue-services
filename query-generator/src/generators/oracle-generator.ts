import { AbstractQueryGenerator } from './generator.base';

export class OracleQueryGeneratorImpl extends AbstractQueryGenerator {
    protected buildQueryLimitsInternal() {
        if (this.generatorState.queryDefinition.rowLimit && this.generatorState.queryDefinition.rowLimit !== 0) {
            this.generatorState.limitsClause = 'rownum <= ' + this.generatorState.queryDefinition.rowLimit;
        }
    }

    composeQuery() {
        if (this.generatorState.queryDefinition.rowLimit && this.generatorState.queryDefinition.rowLimit !== 0) {
            if (this.generatorState.joinClause === '') {
                this.generatorState.joinClause = 'WHERE ' + this.generatorState.limitsClause;
            } else {
                this.generatorState.joinClause += ' and ' + this.generatorState.limitsClause;
            }
        }
        super.composeQuery();
    }
    protected getDbName() {
        return 'Oracle';
    }

}

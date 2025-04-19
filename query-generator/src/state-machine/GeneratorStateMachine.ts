import { AbstractQueryGenerator } from 'src/generators/generator.base';
import { generate } from 'rxjs';

enum GeneratorStateEnum {
    InputValidation,
    BuildSelect,
    BuildFrom,
    BuildWhere,
    BuildGroupBy,
    BuildHaving,
    BuildOrderBy,
    BuildQueryLimit,
    ComposeQuery,
    Error,
    Exit,
}


const SUCCESS_CODE = 0;

export class GeneratorStateMachine {
    done = false;
    nextState = GeneratorStateEnum.InputValidation;
    queryGenerator: AbstractQueryGenerator;
    constructor(theGenerator: AbstractQueryGenerator) {
        this.queryGenerator = theGenerator;
    }

    startStateMachine() {

        while (!this.done) {
            // console.log("GSM: Status: " + JSON.stringify(this.nextState) + " Done:" + this.done);
            switch (+this.nextState) {
                case GeneratorStateEnum.InputValidation:
                    this.inputValidationState();
                    break;
                case GeneratorStateEnum.BuildSelect:
                    this.buildSelectState();
                    break;
                case GeneratorStateEnum.BuildFrom:
                    this.buildFromState();
                    break;
                case GeneratorStateEnum.BuildWhere:
                    this.buildWhereState();
                    break;
                case GeneratorStateEnum.BuildGroupBy:
                    this.buildGroupByState();
                    break;
                case GeneratorStateEnum.BuildHaving:
                    this.buildHavingState();
                    break;
                case GeneratorStateEnum.BuildOrderBy:
                    this.buildOrderByState();
                    break;
                case GeneratorStateEnum.BuildQueryLimit:
                    this.buildQueryLimits();
                    break;
                case GeneratorStateEnum.ComposeQuery:
                    this.composeQueryState();
                    break;
                case GeneratorStateEnum.Error:
                    this.errorState();
                    break;
                case GeneratorStateEnum.Exit:
                    this.exitState();
                    break;
                default:
                    // Shouldn't be here!!! Panic
                    this.exitState();
                    break;
            }
        }
    }

    protected inputValidationState() {
        this.queryGenerator.validateInput();
        if (this.queryGenerator.generatorState.result === SUCCESS_CODE) {
            this.nextState = GeneratorStateEnum.BuildSelect;
        } else {
            this.nextState = GeneratorStateEnum.Error;
        }
    }

    protected buildSelectState() {
        this.queryGenerator.buildSelectClause();
        if (this.queryGenerator.generatorState.result === SUCCESS_CODE) {
            this.nextState = GeneratorStateEnum.BuildFrom;
        } else {
            this.nextState = GeneratorStateEnum.Error;
        }
    }

    protected buildFromState() {
        this.queryGenerator.buildFromClause();
        if (this.queryGenerator.generatorState.result === SUCCESS_CODE) {
            this.nextState = GeneratorStateEnum.BuildWhere;
        } else {
            this.nextState = GeneratorStateEnum.Error;
        }
    }

    protected buildWhereState() {
        this.queryGenerator.buildWhereClause();
        if (this.queryGenerator.generatorState.result === SUCCESS_CODE) {
            this.nextState = GeneratorStateEnum.BuildGroupBy;
        } else {
            this.nextState = GeneratorStateEnum.Error;
        }
    }

    protected buildGroupByState() {
        this.queryGenerator.buildGroupByClause();
        if (this.queryGenerator.generatorState.result === SUCCESS_CODE) {
            this.nextState = GeneratorStateEnum.BuildHaving;
        } else {
            this.nextState = GeneratorStateEnum.Error;
        }
    }

    protected buildHavingState() {
        this.queryGenerator.buildHavingClause();
        if (this.queryGenerator.generatorState.result === SUCCESS_CODE) {
            this.nextState = GeneratorStateEnum.BuildOrderBy;
        } else {
            this.nextState = GeneratorStateEnum.Error;
        }
    }

    protected buildOrderByState() {
        this.queryGenerator.buildOrderByClause();
        if (this.queryGenerator.generatorState.result === SUCCESS_CODE) {
            this.nextState = GeneratorStateEnum.BuildQueryLimit;
        } else {
            this.nextState = GeneratorStateEnum.Error;
        }
    }
    protected buildQueryLimits() {
        this.queryGenerator.buildQueryLimits();
        if (this.queryGenerator.generatorState.result === SUCCESS_CODE) {
            this.nextState = GeneratorStateEnum.ComposeQuery;
        } else {
            this.nextState = GeneratorStateEnum.Error;
        }
    }
    protected composeQueryState() {
        this.queryGenerator.composeQuery();
        if (this.queryGenerator.generatorState.result === SUCCESS_CODE) {
            this.nextState = GeneratorStateEnum.Exit;
        } else {
            this.nextState = GeneratorStateEnum.Error;
        }
    }

    protected exitState() {
        console.log("GeneratorStateMachine: starting: Generated Query: " + this.queryGenerator.generatorState.query);
        this.done = true;
    }

    protected errorState() {
        console.log("GeneratorStateMachine: starting: ErrorState");
        // TODO Do something with the errors. 
        console.log("Generator Error: " + this.queryGenerator.generatorState.result + " : " + this.queryGenerator.generatorState.resultMessage);
        this.nextState = GeneratorStateEnum.Exit;
    }
}
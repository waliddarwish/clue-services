import { WorksheetState } from "./worksheet-state";



export class WorkbookState {

    fileUrl = '';
    worksheetsCount = 0;

    worksheetStates: WorksheetState[] = [];
}
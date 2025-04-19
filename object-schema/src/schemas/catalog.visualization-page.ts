import { ApiProperty } from "@nestjs/swagger";

class VisualizationLayout {
    @ApiProperty()
    x: number;
    @ApiProperty()
    y: number;
    @ApiProperty()
    w: number;
    @ApiProperty()
    h: number;
    @ApiProperty()
    minW: number;
    @ApiProperty()
    minH: number;
}

class Selection {
    @ApiProperty()
    id: string;
    @ApiProperty() 
    text: string;
    @ApiProperty()
    style: any;
    @ApiProperty()
    usageType: string;
    @ApiProperty()
    defaultAggregation : string;
    @ApiProperty()
    defaultFormat:string;
}
class Visualization { 
    @ApiProperty()
    id: string;
    @ApiProperty()
    title: any;
    @ApiProperty()
    subTitle: any;
    @ApiProperty()
    description: any;
    @ApiProperty({ type: [Selection]})
    xAxisSelection: Selection[];
    @ApiProperty({ type: [Selection]})
    yAxisSelection: Selection[];;
    @ApiProperty({ type: [Selection]})
    repeatAxisSelection: Selection[];
    @ApiProperty({ type: [Selection]})
    polarAxisSelection: Selection[];
    @ApiProperty({ type: [Selection]})
    polarAngleSelection: Selection[];
    @ApiProperty()
    chartType: string;
    @ApiProperty()
    chartObject: string;
    @ApiProperty()
    vizQuery: any;
    @ApiProperty()
    layout: VisualizationLayout;
}


class VisualizationPageLayout {
    @ApiProperty()
    cols: number;
    @ApiProperty()
    rowHeight: number;
    @ApiProperty()
    className: string;
    @ApiProperty()
    autoSize: boolean;
    @ApiProperty()
    compactType: string;
    @ApiProperty()
    marginx: number;
    @ApiProperty()
    marginy: number;
    @ApiProperty()
    containerPaddingx: number;
    @ApiProperty()
    containerPaddingy: number;
    @ApiProperty()
    isDraggable: boolean;
    @ApiProperty()
    isResizable: boolean;
    @ApiProperty()
    preventCollision: boolean;
}
export class VisualizationPageObject {
    @ApiProperty()
    id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    title: string;
    @ApiProperty()
    subTitle: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    tenantId: string;
    @ApiProperty()
    visualizationBookId: string;
    @ApiProperty( { type : [Visualization] } )
    visualizations : Visualization[];
    @ApiProperty()
    layout: VisualizationPageLayout
}


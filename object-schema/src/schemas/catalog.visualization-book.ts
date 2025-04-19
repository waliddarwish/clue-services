import { ApiProperty } from "@nestjs/swagger";

export class VisualizationBookObject {
    @ApiProperty()
    id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    clueModelId: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    tenantId: string;
    @ApiProperty()
    creationDate: number;

}


import { ApiProperty } from "@nestjs/swagger";

class SpecObject {
    @ApiProperty()
    objectId: string;
    @ApiProperty()
    objectName: string;
}
export class ImportSpecObject {
    @ApiProperty()
    connectionId: string;
    @ApiProperty({ type : [SpecObject] })
    objects: SpecObject[];
    @ApiProperty()
    trackerId: string;
}

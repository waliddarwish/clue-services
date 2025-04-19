import { ApiProperty } from "@nestjs/swagger";

export class NodeObject {
    @ApiProperty()
    id: string;
    @ApiProperty()
    type: string;
    @ApiProperty()
    server: string;
    @ApiProperty()
    port: number;
    @ApiProperty()
    config: any;
    @ApiProperty()
    lastSelected: number;
    @ApiProperty()
    lastAliveTimeStamp: number;
    @ApiProperty()
    status: string; // Online, Offline
}

import { ApiProperty } from "@nestjs/swagger";

export class InvitationObject {
    @ApiProperty()
    id: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    tenantId: string;
    @ApiProperty()
    status: string;
    @ApiProperty()
    role: string;
    @ApiProperty()
    invitationDate: number;
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    lastName: string;
}
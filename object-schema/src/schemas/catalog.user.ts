import { ApiProperty } from "@nestjs/swagger";

class UserFullName { 
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    lastName: string;
}
export class UserObject {
    @ApiProperty()
    username: string;
    @ApiProperty()
    password: string;
    @ApiProperty()
    id: string;
    @ApiProperty()
    role: string;
    @ApiProperty()
    tenantId: string;
    @ApiProperty()
    name: UserFullName;
    @ApiProperty()
    status: string;
    @ApiProperty()
    userLanguage: string;
    @ApiProperty()
    userTimeZone: string;
    @ApiProperty()
    passwordStatus: string;
    @ApiProperty()
    lastLoginTime: number;
    @ApiProperty()
    lastLoginSuccessful: boolean;
}


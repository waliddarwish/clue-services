import { ApiProperty } from "@nestjs/swagger";

export class TenantObject {
    @ApiProperty()
    name: string;
    @ApiProperty()
    id: string;
    @ApiProperty()
    address: string;
    @ApiProperty()
    businessType: string;
    @ApiProperty()
    paymentDetails: any;
    @ApiProperty()
    phoneNumber: string;
    @ApiProperty()
    status: string;
    @ApiProperty()
    subscriptionPlan: string;
    @ApiProperty()
    dataConnectionCount: number;
}

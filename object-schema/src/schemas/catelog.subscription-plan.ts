import { ApiProperty } from "@nestjs/swagger";

export class SubscriptionPlanObject {
  @ApiProperty()
  id: string;
  @ApiProperty()
  planName: string;
  @ApiProperty()
  planSubTitle: string;
  @ApiProperty()
  planDescription: string;
  @ApiProperty()
  planStripeCode: string;
  @ApiProperty()
  planPrice: string;
  @ApiProperty()
  planMarketingStatement: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  lastUpdate: number;
  @ApiProperty()
  concurrency: number;
  @ApiProperty()
  storageLimit: number;
}

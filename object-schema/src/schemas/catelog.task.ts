import { ApiProperty } from "@nestjs/swagger";

class TaskParam {
  @ApiProperty()
  name: string;
  @ApiProperty()
  value: string;
}
export class TaskObject {
  @ApiProperty()
  id: string;
  @ApiProperty()
  taskType: string;
  @ApiProperty()
  schedulingType: string;
  @ApiProperty()
  schedulingString: string;
  @ApiProperty({ type: [TaskParam]})
  taskParam: TaskParam[];
  @ApiProperty()
  tenantId: string;
}
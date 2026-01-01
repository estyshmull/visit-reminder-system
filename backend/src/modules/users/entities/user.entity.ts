import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '../../../common/enums'

export class UserEntity {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  firstName: string

  @ApiProperty()
  lastName: string

  @ApiProperty({ enum: UserRole })
  role: UserRole

  @ApiProperty({ required: false })
  phone?: string

  @ApiProperty()
  isActive: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

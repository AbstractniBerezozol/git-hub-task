import { IsNotEmpty, IsString, Length } from '@nestjs/class-validator';

export class AuthPayloadDto {
  @IsNotEmpty()
  @IsString()
  username: string;
  @IsNotEmpty()
  @IsString()
  @Length(7,50)
  password: string;
  
}

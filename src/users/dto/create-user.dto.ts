import { IsEmail, IsString } from "@nestjs/class-validator";


export class CreateUserDto {
    @IsString()
    username: string;
    @IsString()
    password: string;
    @IsEmail()
    email: string;
}

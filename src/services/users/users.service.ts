import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import { UpdateUserDto } from '@/controllers/users/dto/updateUser.dto';
import { UserDto as CreateUserDto } from '@/controllers/users/dto/user.dto';
import { PrismaService } from '@/database/prisma.service';
import { IdDto } from '@/dtos/id.dto';
import { UserDto } from '@/dtos/user.dto';
import { ApiError } from '@/exceptions';

import { AuthorsService } from '../authors/authors.service';
import { MailService } from '../mail/mail.service';
import { TokensService } from '../tokens/tokens.service';

type UserConverted = {
  id: number;
  firstName: string;
  lastName: string | null;
  avatar: string | null;
  login: string;
  password: string;
  createdAt: Date | string | null;
  isAdmin: boolean;
  email: string;
  activateLink?: string;
  isActivated: boolean;
};
const adminEmail = ['tabasaranec96@mail.ru'];
@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private authorsService: AuthorsService,
    private mailService: MailService,
    private jwtService: JwtService,
    private tokensService: TokensService,
  ) {}

  async registration({
    firstName,
    lastName,
    login,
    email,
    password,
    avatar = null,
  }: CreateUserDto) {
    const isAdmin = adminEmail.includes(email);

    const candidate = await this.getOne({ login });

    if (candidate !== null) {
      return ApiError.BadRequest(`User with this login ${login} exists`);
    }

    const hashPassword = await bcrypt.hash(password, 7);
    const activateLink = uuid();
    try {
      await this.mailService.sendActivationMail({
        to: email,
        link: activateLink,
      });

      const user = await this.prismaService.user.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          avatar,
          login,
          activate_link: activateLink,
          admin: isAdmin,
          email,
          password: hashPassword,
        },
      });
      // this.convertCase(user)
      const userDto = new UserDto();
      const tokens = this.tokensService.generateTokens({ ...userDto });
      await this.tokensService.create({
        userId: userDto.id,
        refreshToken: tokens.refreshToken,
      });

      return { ...this.convertCase(user), ...tokens };
    } catch (error) {
      console.log(error);

      return {} as any;
    }
  }

  async activate(activateLink: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        activate_link: { equals: activateLink },
        is_activated: false,
      },
    });
    if (!user) {
      return user;
    }
    const userUpdated = await this.prismaService.user.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        is_activated: true,
      },
    });

    return this.convertCase(userUpdated);
  }

  async login({ login, password }: { login: string; password: string }) {
    const user = await this.getOne({ login });

    if (user === null) {
      return ApiError.BadRequest(`User ${login} not found`);
    }

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      return ApiError.BadRequest('Wrong password');
    }
    // user
    const userDto = new UserDto();
    const tokens = this.tokensService.generateTokens({ ...userDto });
    await this.tokensService.create({
      userId: userDto.id,
      refreshToken: tokens.refreshToken,
    });

    return { ...user, ...tokens };
  }

  async logout(refreshToken: string) {
    const token = await this.tokensService.delete({ refreshToken });

    return token;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      return ApiError.UnauthorizeError();
    }

    const userData = this.tokensService.validateRefresh(refreshToken);
    const tokenFromDb = await this.tokensService.getOne({ refreshToken });

    if (!userData && !tokenFromDb) {
      return ApiError.UnauthorizeError();
    }

    if (typeof userData !== 'object' || userData === null) {
      return ApiError.UnauthorizeError();
    }

    const user = await this.getById({ id: userData.id });

    if (!user) {
      return ApiError.UnauthorizeError();
    }
    // user
    const userDto = new UserDto();
    const tokens = this.tokensService.generateTokens({ ...userDto });

    await this.tokensService.create({
      userId: userDto.id,
      refreshToken: tokens.refreshToken,
    });

    return { ...userData, ...tokens };
  }

  async update({
    id,
    firstName,
    lastName,
    avatar,
    login,
    password,
  }: IdDto & UpdateUserDto) {
    const user = await this.getOne({ login });

    if (user === null) {
      return ApiError.BadRequest(`User ${login} not found`);
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      return ApiError.BadRequest('Wrong password');
    }

    const userUpdated = await this.prismaService.user.update({
      where: {
        user_id: Number(id),
      },
      data: {
        first_name: firstName,
        last_name: lastName,
        avatar,
        login,
      },
    });

    return this.convertCase(userUpdated);
  }

  async partialUpdate(body: UpdateUserDto) {
    const bodyProps = Object.keys(body);
    const bodyValues = Object.values(body);
    const snakeReg = /([a-z0–9])([A-Z])/g;
    const setParams = bodyProps.map(
      (el, i) => `${el.replace(snakeReg, '$1_$2').toLowerCase()} = $${i + 1}`,
    );

    // const query = `UPDATE ${tableName}
    //                   SET ${setParams.join(', \n')}
    //                 WHERE login = $${setParams.length + 1}
    //             RETURNING user_id, first_name, last_name, avatar, login, admin, created_at`;

    // const { rows } = await db.query(query, [...bodyValues]);
    // const data = rows[0];

    return this.convertCase({} as any);
  }

  async getAll({ page, perPage }: { page: number; perPage: number }) {
    console.log('totalCount');
    const [totalCount, data] = await this.prismaService.$transaction([
      this.prismaService.user.count(),
      this.prismaService.user.findMany({ skip: page * perPage, take: perPage }),
    ]);

    const users = data.map((user) => this.convertCase(user));

    return {
      count: data.length,
      totalCount,
      users,
    };
  }

  async getOne({ login }: { login: string }) {
    const user = await this.prismaService.user.findUnique({
      where: { login },
    });

    return user ? this.convertCase(user) : user;
  }

  async getById({ id }: IdDto) {
    const user = await this.prismaService.user.findUnique({
      where: { user_id: Number(id) },
    });

    return user ? this.convertCase(user) : user;
  }

  async delete({ id }: IdDto) {
    await this.authorsService.deleteUserAuthors(id);
    const user = await this.prismaService.user.delete({
      where: { user_id: Number(id) },
    });

    return this.convertCase(user);
  }

  // eslint-disable-next-line class-methods-use-this
  private convertCase(user: User): UserConverted {
    return {
      id: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar,
      login: user.login,
      isAdmin: user.admin,
      activateLink: user.activate_link,
      createdAt: user.created_at,
      password: user.password,
      email: user.email || '',
      isActivated: user.is_activated,
    };
  }
}

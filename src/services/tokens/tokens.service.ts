import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jsonwebtoken from 'jsonwebtoken';

import { PrismaService } from '@/database/prisma.service';
import { UserDto } from '@/dtos/user.dto';

@Injectable()
export class TokensService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: jsonwebtoken,
    private readonly configService: ConfigService,
  ) {}

  generateTokens(payload: UserDto): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    return { accessToken, refreshToken };
  }

  validateAccess(token: string) {
    try {
      const userData = this.jwtService.verify(token);

      return userData;
    } catch (error) {
      return null;
    }
  }

  validateRefresh(token: string) {
    try {
      const userData = this.jwtService.verify(token);

      return userData;
    } catch (error) {
      return null;
    }
  }

  async create({
    userId,
    refreshToken,
  }: {
    refreshToken: string;
    userId: number;
  }): Promise<Token> {
    const tokenData = await this.getById({ userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      const tkn = await this.update(tokenData);

      return tkn;
    }

    const token = await this.prismaService.token.create({
      data: {
        refresh_token: refreshToken,
        fk_user_id: userId,
      },
    });

    return this.convertCase(token);
  }

  async getById({ userId }: { userId: number }): Promise<Token | null> {
    const token = await this.prismaService.token.findFirst({
      where: {
        fk_user_id: userId,
      },
    });

    if (token === null) {
      return null;
    }

    return this.convertCase(token);
  }

  async getOne({
    refreshToken,
  }: {
    refreshToken: string;
  }): Promise<Token | null> {
    const token = await this.prismaService.token.findUnique({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (token === null) {
      return null;
    }

    return this.convertCase(token);
  }

  async update({
    userId,
    refreshToken,
  }: {
    refreshToken: string;
    userId: number;
  }) {
    const token = await this.prismaService.token.update({
      where: {
        fk_user_id: userId,
      },
      data: {
        refresh_token: refreshToken,
      },
    });

    return this.convertCase(token);
  }

  async delete({ refreshToken }: { refreshToken: string }) {
    const token = await this.prismaService.token.delete({
      where: {
        refresh_token: refreshToken,
      },
    });

    return this.convertCase(token);
  }

  // eslint-disable-next-line class-methods-use-this
  private convertCase(token: TokenRow): Token {
    return {
      refreshToken: token.refresh_token,
      userId: token.fk_user_id,
    };
  }
}

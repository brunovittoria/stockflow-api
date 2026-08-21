import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import jwksRsa from 'jwks-rsa'
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service'

export type Auth0JwtPayload = {
  sub: string
  aud?: string | string[]
  iss?: string
  scope?: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(envConfig: EnvConfigService) {
    const domain = envConfig.getAuth0Domain()
    const issuer = `https://${domain}/`

    super({
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: envConfig.getAuth0Audience(),
      issuer,
      algorithms: ['RS256'],
    })
  }

  validate(payload: Auth0JwtPayload): Auth0JwtPayload {
    return payload
  }
}

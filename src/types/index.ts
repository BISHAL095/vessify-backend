// The shape of data attached to context by auth middleware
export type AppVariables = {
 userId: string
 orgId: string
 email: string
}

export type JWTPayload = {
 sub: string // userId
 orgId: string
 email: string
 exp: number
}
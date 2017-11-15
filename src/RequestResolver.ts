/**
 * HTTP methods according to :
 * - https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
 * - https://tools.ietf.org/html/rfc5789
 */
enum HTTPMethod {
  OPTIONS,
  GET,
  HEAD,
  POST,
  PUT,
  DELETE,
  TRACE,
  CONNECT,
  PATCH,
}

/**
 * Cors config according to :
 * - https://www.w3.org/TR/2014/REC-cors-20140116/#syntax
 */
interface CorsConfig {
  'Access-Control-Allow-Origin' ?: [string],
  'Access-Control-Allow-Credentials'?: boolean,
  'Access-Control-Expose-Headers'?: [string],
  'Access-Control-Max-Age'?: number,
  'Access-Control-Allow-Methods'?: [HTTPMethod],
  'Access-Control-Allow-Headers'?: [string],
}

interface RequestResolverConfiguration {
  routingDemands: [string],
  corsConfig: CorsConfig
}

interface RequestResolverInterface {
  // config: RequestResolverConfiguration
}

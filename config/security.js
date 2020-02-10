/**
 * Security Settings
 * (sails.config.security)
 *
 * These settings affect aspects of your app's security, such
 * as how it deals with cross-origin requests (CORS) and which
 * routes require a CSRF token to be included with the request.
 *
 * For an overview of how Sails handles security, see:
 * https://sailsjs.com/documentation/concepts/security
 *
 * For additional options and more information, see:
 * https://sailsjs.com/config/security
 */

module.exports.security = {
  jwtSecret: process.env.TOKEN_SECRET || "fGeyJpZCI6NCwiaWF0IjoxNDk0ODY3NDQ0LCJleHAiOjE0OTQ4NzgyNDR9",
  encryptSecret: "9RDNygzN4QTO0EjOiAHelJCL0QDN3YDO0kDNxojI0FWaiwCN6ICZpJyeGf"
  /***************************************************************************
  *                                                                          *
  * CORS is like a more modern version of JSONP-- it allows your application *
  * to circumvent browsers' same-origin policy, so that the responses from   *
  * your Sails app hosted on one domain (e.g. example.com) can be received   *
  * in the client-side JavaScript code from a page you trust hosted on _some *
  * other_ domain (e.g. trustedsite.net).                                    *
  *                                                                          *
  * For additional options and more information, see:                        *
  * https://sailsjs.com/docs/concepts/security/cors                          *
  *                                                                          *
  ***************************************************************************/

  // cors: {
  //   allRoutes: false,
  //   allowOrigins: '*',
  //   allowCredentials: false,
  // },


  /****************************************************************************
  *                                                                           *
  * By default, Sails' built-in CSRF protection is disabled to facilitate     *
  * rapid development.  But be warned!  If your Sails app will be accessed by *
  * web browsers, you should _always_ enable CSRF protection before deploying *
  * to production.                                                            *
  *                                                                           *
  * To enable CSRF protection, set this to `true`.                            *
  *                                                                           *
  * For more information, see:                                                *
  * https://sailsjs.com/docs/concepts/security/csrf                           *
  *                                                                           *
  ****************************************************************************/

  // csrf: false

};

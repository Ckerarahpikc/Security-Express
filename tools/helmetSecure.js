const helmet = require("helmet");

// 2. How it's helping - helps to secure the http responses by setting a bunch of useful (or not) headers
const securityMiddleware = helmet({
  // what - protect from a large number of attack, such as cross-site-scripting (requires some configurations)
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"], // only allow content from the same domain as your webiste
      "script-src": ["'self'", "trusted-cdn.com"], // scripts can only be loaded from your website or a trusted external source, in this case, "trusted-cdn.com"
      "style-src": [
        "'self'",
        "trusted-cdn.com",
        "https://fonts.googleapis.com"
      ], // similarly, this directive controls where stylesheets can be loaded from, ensuring that only trusted sources are used
      "script-src-elem": [
        "'self'",
        "trusted-cdn.com",
        "https://cdn.jsdelivr.net"
      ]
    }
  },

  // what - prevents clickjacking by disallowing iframes, attackers use 'iframes' to make thinking you are clicking on something you want to, insetad you may clicking on something completely different (send, purchase, download, ...)
  frameguard: {
    action: "deny" // instructs the browser to completely block your website from being embedded within an iframe on any other site
  },

  // what - HTTP Strict Transport Security enforce to use https instead of http to prevent attacks like woman-in-the-middle
  hsts: {
    maxAge: 31_536_000_000, // sets the duration (in seconds) for which the browser should remember to only use HTTPS for your site. In this case, it's set for 1 year
    includeSubDomains: true, // ensures that the HTTPS enforcement applies not just to your main domain, but also to all subdomains. For example, if your main domain is 'example.com', it will also apply to 'sub.example.com'
    preload: true // this is providing an additional layer of security, even before a user visits your site for the first time
  },

  // what - controls how much referrer info (URI) should be included with request made from our site
  referrerPolicy: {
    policy: "no-referrer" // when a user clicks a link or makes a request from your site to another site, the destination site will not receive any information about the original page the user was on, u got it?
  },

  // ok - basic xss filter
  xssFilter: true, // basic filter that helps detect and block some common types of XSS attacks

  // what - hide "X-Powered-By" header
  hidePoweredBy: true, // by hiding this header, you prevent others from easily determining what technologies your site is running on (for example we use Express then 'X-Powered-By: Express')

  // what - DNS prefetching, technique used by browsers to resolve domain names before a user actually clicks on a link
  dnsPrefetchControl: { allow: false },

  // prevent browsers to user files as a different MIME type than what is specified
  noSniff: true, // prevent the browser from preventing resolving domain names for links on your site

  // security feature that prevents Internet Explorer (IE) from opening certain types of files directly within its own context or frame (nerd explanation)
  ieNoOpen: true //  Internet Explorer is restricted from opening files (like documents, PDFs, or other file types) directly within its own browser window or frame
});

module.exports = securityMiddleware;

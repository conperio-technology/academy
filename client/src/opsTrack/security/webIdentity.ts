import { src, type OpsLessonData } from "../types.ts";

export const secWebIdentity: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "HTTP is stateless: every request arrives on its own, and the server has to work out from the request itself who sent it. Everything in this lesson is an answer to that question. A session cookie points at state the server keeps. A token such as a JWT carries signed claims, so the server keeps nothing. OAuth 2.0 lets one app act on your behalf at another without your password, and OpenID Connect and SAML let one identity provider log you in everywhere (single sign-on).",
        "The browser adds its own rules on top: which cookies it sends with which requests, and which pages may read responses from which servers (the same-origin policy and CORS). Most web identity bugs come from mixing these up, so the lesson ends with a CORS checker you can try settings in.",
      ],
    },
    {
      kind: "table",
      title: "Session cookies or tokens?",
      head: ["", "Server-side session + cookie", "Self-contained token (JWT)"],
      rows: [
        ["What the client holds", "a random session id", "signed claims: user id, roles, expiry"],
        ["What the server stores", "the session (in memory, Redis or a database)", "nothing per user; only the signing key"],
        ["Logout or revoke", "delete the session: instant", "hard: the token stays valid until it expires, unless you keep a deny list"],
        ["Scaling out", "every server needs the shared session store", "any server with the key can check it"],
        ["Typical use", "classic web apps on one domain", "APIs, mobile apps, service to service calls, OIDC ID tokens"],
      ],
      notes: [
        "A JWT can also travel in a cookie; cookie or Authorization header is about transport, session or token is about where the state lives. For a browser app on one domain, an HttpOnly session cookie is still the simplest safe choice.",
      ],
    },
    {
      kind: "terms",
      title: "Cookie attributes that matter for security",
      terms: [
        { term: "HttpOnly", meaning: "JavaScript can't read the cookie through document.cookie, so an XSS bug can't steal it (though it can still make requests that carry it)." },
        { term: "Secure", meaning: "sent only over HTTPS, never over plain HTTP where anyone on the network could read it." },
        { term: "SameSite=Lax", meaning: "what Chrome and Edge assume when a cookie sets no SameSite; set it explicitly. Not sent on cross-site subrequests such as a form POST from another site, but sent when the user follows a link to your site. Stops most CSRF." },
        { term: "SameSite=Strict", meaning: "never sent on any cross-site request, even a link click, so users arriving from elsewhere look logged out on the first page." },
        { term: "SameSite=None", meaning: "always sent, including cross-site; browsers require Secure with it. Needed for embedded widgets and some SSO flows." },
        { term: "Domain and Path", meaning: "which hosts and paths receive the cookie. Leave Domain unset to keep the cookie to the exact host; setting it shares the cookie with every subdomain." },
        { term: "Expires or Max-Age", meaning: "without one the cookie lasts until the browser session ends. Keep session cookie lifetimes short and expire them on the server too." },
        { term: "__Host- prefix", meaning: "a name starting __Host- is only accepted with Secure, Path=/ and no Domain, so a subdomain can't overwrite it." },
      ],
    },
    {
      kind: "code",
      title: "A safe session cookie",
      blocks: [
        {
          lang: "http",
          label: "HTTP response header",
          code: src`
Set-Cookie: __Host-session=Yx3pK9...; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`,
        },
      ],
      notes: ["The value is a long random id from a secure generator, looked up on the server on every request. Issue a new one at login, so an id planted before login (session fixation) is worthless."],
    },
    {
      kind: "text",
      title: "JWT anatomy",
      paragraphs: [
        "A JSON Web Token is three base64url parts joined by dots: header.payload.signature. The header says how it was signed (alg), the payload holds the claims, and the signature covers the first two. Standard claims include sub (who it is about), iss (who issued it), aud (who it is for), exp (expiry, in seconds since 1970) and iat (issued at).",
        "The header and payload are encoded, not encrypted: anyone holding the token can read them, as the decoder below shows without any key. What the signature gives is integrity. HS256 is an HMAC with a shared secret, so whoever checks the token can also mint one. RS256 and ES256 are signatures: the issuer signs with a private key and any service can verify with the public key, which the issuer usually publishes as a JWKS (JSON Web Key Set) URL.",
      ],
    },
    {
      kind: "code",
      title: "Reading a JWT needs no key",
      blocks: [
        {
          lang: "python",
          label: "jwt_demo.py",
          code: src`
import base64, json

token = ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
         ".eyJzdWIiOiIxMDQyIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NjcyMjkyMDB9"
         ".signature-goes-here")
header_b64, payload_b64, _ = token.split(".")

def b64url_decode(part):
    return base64.urlsafe_b64decode(part + "=" * (-len(part) % 4))

print(json.loads(b64url_decode(header_b64)))
print(json.loads(b64url_decode(payload_b64)))`,
          output: src`
{'alg': 'HS256', 'typ': 'JWT'}
{'sub': '1042', 'role': 'user', 'exp': 1767229200}`,
        },
      ],
      notes: ["To trust a token, use a library that checks the signature with a key and algorithm you choose, then exp, iss and aud. Never decode and trust, and never let the token's own alg header pick the algorithm: accepting \"none\", or verifying an HS256 token using the RSA public key as the HMAC secret, are real past attacks."],
    },
    {
      kind: "widget",
      widget: "jwtLab",
      title: "Try it: sign a JWT and tamper with it",
      intro: "This signs a real HS256 token in your browser. Edit the claims or the secret and the signature changes. Tick the box to play an attacker who edits the payload but can't re-sign it.",
    },
    {
      kind: "text",
      title: "OAuth 2.0: delegated access, not login",
      paragraphs: [
        "OAuth 2.0 answers \"may this app do things at that service on my behalf?\" A photo printing site wants to read your cloud photos; instead of asking for your password, it sends you to the photo service, you approve a scope such as photos.read, and the site gets an access token limited to that. The roles are the resource owner (you), the client (the printing site), the authorization server (which logs you in and issues tokens) and the resource server (the photo API).",
        "OAuth on its own is about authorization, not authentication: an access token says what the client may do, not who is at the keyboard. The flow to use for web apps, single-page apps and mobile apps alike is the authorization code flow with PKCE. The older implicit flow, which returned tokens in the URL, and the password grant are deprecated.",
      ],
    },
    {
      kind: "walkthrough",
      title: "The authorization code flow with PKCE",
      intro: "Step through one login. PKCE (Proof Key for Code Exchange, said \"pixie\") stops a stolen authorization code from being usable by anyone but the app that started the flow.",
      steps: [
        {
          title: "1. The app makes a secret and its fingerprint",
          body: "Before redirecting, the app generates a random code_verifier and keeps it. It computes code_challenge = base64url(SHA-256(verifier)). It also generates a random state value to tie the response to this request.",
        },
        {
          title: "2. Redirect to the authorization server",
          body: "The browser goes to the authorization server with the client id, the redirect URI, the requested scopes, the state and the code_challenge. Only the fingerprint travels here, never the verifier.",
          code: "GET https://auth.example.com/authorize?response_type=code\n  &client_id=print-app&redirect_uri=https://print.example/callback\n  &scope=openid%20photos.read&state=af0ifjsldkj\n  &code_challenge=JJATldSBSmDOmfguvHwwli0zQsEgKKFJEo8EuXknABw\n  &code_challenge_method=S256",
          lang: "http",
        },
        {
          title: "3. The user logs in and consents",
          body: "The authorization server, not the app, shows the login page (and MFA), then asks whether to grant the scopes. The app never sees the password. The server then redirects back to the registered redirect URI with a short-lived, single-use authorization code and the same state.",
          code: "302 Location: https://print.example/callback?code=SplxlOBeZQQYbYS6WxSbIA&state=af0ifjsldkj",
          lang: "http",
        },
        {
          title: "4. The app swaps the code for tokens",
          body: "The app checks that state matches what it sent (stopping a forged callback), then posts the code and the original code_verifier to the token endpoint over a back channel. The server hashes the verifier and checks it equals the challenge from step 2. Someone who intercepted the code in the redirect doesn't have the verifier, so the code is useless to them.",
          code: "POST https://auth.example.com/token\n  grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA\n  &redirect_uri=https://print.example/callback&client_id=print-app\n  &code_verifier=my-fixed-example-verifier-for-this-page-0123456789",
          lang: "http",
        },
        {
          title: "5. Tokens come back",
          body: "The response holds an access token (short-lived, often 5 to 60 minutes, sent as Authorization: Bearer to the API), usually a refresh token (long-lived, used only at the token endpoint to get new access tokens, and rotated on each use) and, because the openid scope was asked for, an ID token.",
        },
        {
          title: "6. Call the API",
          body: "The resource server checks the access token's signature, expiry, audience and scopes on every request. When it expires, the app uses the refresh token. Logging out revokes the refresh token, and the short access token lifetime limits how long a stolen one is useful.",
        },
      ],
    },
    {
      kind: "code",
      title: "Making the PKCE challenge",
      blocks: [
        {
          lang: "python",
          label: "pkce_demo.py",
          code: src`
import base64, hashlib, secrets

def b64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

verifier = b64url(secrets.token_bytes(32))  # a fresh random one for every login
print(len(verifier))
verifier = "my-fixed-example-verifier-for-this-page-0123456789"  # fixed, so the output repeats
challenge = b64url(hashlib.sha256(verifier.encode()).digest())
print(challenge)`,
          output: src`
43
JJATldSBSmDOmfguvHwwli0zQsEgKKFJEo8EuXknABw`,
        },
      ],
      notes: ["The specification wants a verifier of 43 to 128 characters; 32 random bytes encode to exactly 43. In practice a library (MSAL, an OIDC client, ASP.NET Core's OpenID Connect handler) does all of this for you."],
    },
    {
      kind: "text",
      title: "OpenID Connect: login on top of OAuth",
      paragraphs: [
        "OpenID Connect (OIDC) adds authentication to OAuth 2.0. Ask for the openid scope and the token response also contains an ID token: a JWT signed by the identity provider whose sub claim identifies the user, aud is your client id, iss is the provider, and a nonce ties it to your login request. Your app verifies that signature and those claims, and then it knows who logged in.",
        "The ID token is for your app to read; don't send it to APIs as an access token. OIDC also standardizes discovery (a /.well-known/openid-configuration document listing the endpoints and keys) and a userinfo endpoint. Entra ID, Google, Okta and Auth0 all speak it, which is why \"Sign in with\" buttons work the same everywhere.",
      ],
    },
    {
      kind: "text",
      title: "Single sign-on and SAML",
      paragraphs: [
        "Single sign-on means one login at an identity provider (IdP) gets you into many applications (service providers). The IdP holds the passwords and MFA; each app trusts the IdP's signed statement about who you are. Turning off one account at the IdP removes access everywhere, which is the main reason companies require it.",
        "SAML 2.0 is the older SSO standard, still everywhere in enterprise software. The app redirects the browser to the IdP, the user logs in, and the IdP posts a signed XML assertion back through the browser to the app's assertion consumer service URL. The app checks the XML signature against the IdP's certificate it was configured with, plus the audience, the time window and that the assertion wasn't used before.",
      ],
    },
    {
      kind: "table",
      title: "OAuth 2.0, OpenID Connect and SAML",
      head: ["", "OAuth 2.0", "OpenID Connect", "SAML 2.0"],
      rows: [
        ["Answers", "may this app act for me?", "who is this user?", "who is this user?"],
        ["Token", "access token (opaque or JWT), refresh token", "ID token (JWT) plus OAuth tokens", "signed XML assertion"],
        ["Format", "JSON over HTTPS", "JSON and JWT", "XML"],
        ["Typical use", "API access, third-party integrations", "modern SSO, mobile and single-page apps", "enterprise SSO into SaaS apps"],
        ["Era", "2012", "2014", "2005"],
      ],
      notes: ["Kerberos (see Group Policy, Kerberos, NTLM and DNS) is the SSO you get inside a Windows domain; OIDC and SAML do the same job across the internet."],
    },
    {
      kind: "text",
      title: "The same-origin policy and CORS",
      paragraphs: [
        "An origin is scheme + host + port: https://app.example.com and https://api.example.com are different origins, and so are http:// and https:// versions of one host. The same-origin policy says a page's JavaScript may send requests anywhere, but may only read responses from its own origin. Without it, any site you visited could read your webmail with your cookies.",
        "CORS (Cross-Origin Resource Sharing) is how a server opts out for specific origins. The browser adds an Origin header, and the server answers with Access-Control-Allow-Origin naming who may read the response. Requests that go beyond what an HTML form could send (methods such as PUT or DELETE, a JSON content type, an Authorization header) first get a preflight: an OPTIONS request asking permission, and the real request goes only if the answer allows it.",
        "CORS protects the user's browser, not your server. A plain cross-site POST with a form-style body is still sent and still runs on the server; CORS only stops the page reading the reply. So CORS is not CSRF protection, and curl or a backend ignores it completely. Authorization still has to happen on every request.",
      ],
    },
    {
      kind: "widget",
      widget: "corsChecker",
      title: "Try it: will the browser allow it?",
      intro: "Pick the page's origin and the request, then the headers the API sends back. The checker follows the browser's rules: whether a preflight happens, whether the request is sent, and whether the page may read the answer.",
    },
    {
      kind: "steps",
      title: "Rules of thumb",
      steps: [
        "For a browser app on your own domain, prefer a server-side session in a Secure, HttpOnly, SameSite cookie.",
        "Use OIDC with the authorization code flow and PKCE for login, through a maintained library, rather than building login yourself.",
        "Keep access tokens short-lived; rotate refresh tokens and store them only where scripts can't reach them.",
        "Verify every JWT's signature with a fixed algorithm, and check exp, iss and aud.",
        "In CORS, list exact trusted origins. Never reflect whatever Origin arrives, and never combine credentials with a wildcard.",
      ],
    },
  ],
  quiz: [
    {
      question: "Anyone who gets hold of a JWT can do what with it, without the key?",
      answer: "Read every claim in its payload",
      distractors: ["Nothing, it is encrypted", "Change the claims and keep it valid", "Recover the signing secret from the signature"],
      why: "The header and payload are base64url, not encryption. The signature stops changes, not reading, so never put secrets in a JWT.",
    },
    {
      question: "What does PKCE protect against in the authorization code flow?",
      answer: "An attacker who intercepts the authorization code exchanging it for tokens",
      distractors: ["Phishing pages that copy the login screen", "XSS on the authorization server", "Tokens that are too long-lived"],
      why: "Only the app that started the flow holds the code_verifier, and the token endpoint requires it. A stolen code alone is worthless.",
    },
    {
      question: "Which token tells your app who the user is?",
      answer: "The OpenID Connect ID token",
      distractors: ["The OAuth access token", "The refresh token", "The authorization code"],
      why: "OAuth tokens are about permission to call APIs. The ID token is a signed statement from the identity provider about the user, addressed to your app.",
    },
    {
      question: "Your API sends Access-Control-Allow-Origin: * and the page sends fetch with credentials: \"include\". What happens?",
      answer: "The browser refuses to let the page read the response",
      distractors: ["It works, the wildcard covers every origin", "The cookie isn't sent but the page can read the response", "The server rejects the request"],
      why: "With credentials, the server must name the exact origin and send Access-Control-Allow-Credentials: true. The wildcard is only for public, uncredentialed responses.",
    },
    {
      question: "Why is a session cookie set with HttpOnly?",
      answer: "So injected JavaScript can't read and steal it",
      distractors: ["So it is only sent over HTTPS", "So other sites can't send it", "So it expires when the browser closes"],
      why: "HttpOnly hides it from document.cookie. Secure is the HTTPS-only flag and SameSite controls cross-site sending.",
    },
  ],
  pitfalls: [
    "Trusting a decoded JWT without verifying its signature, or letting its alg header choose the algorithm.",
    "Storing long-lived tokens in localStorage, where any XSS on the page can read them.",
    "Using the OAuth implicit flow or the password grant, both deprecated, instead of code with PKCE.",
    "Echoing the request's Origin back in Access-Control-Allow-Origin together with Allow-Credentials, which lets every site read users' data.",
    "Treating CORS as a security boundary for the server or as CSRF protection; it only limits what browser pages can read.",
    "Skipping the state or nonce checks, which lets an attacker splice their own login into a victim's session.",
  ],
  next: [
    { id: "security-authn-authz", label: "Authentication vs. Authorization" },
    { id: "sec-access-control-ssrf-csrf", label: "Broken Access Control: IDOR, CSRF and SSRF" },
    { id: "sd-api-auth-limits", label: "API Keys, OAuth Scopes, Rate Limits and Quotas" },
  ],
};

<?php
// Copy this file to config.php ON THE SERVER and fill it in. Never commit real values.
// (Real environment variables with the same names also work and take priority.)
return [
    'ENQUIRY_TO_EMAIL' => 'info@treatresorts.com',     // where enquiries are emailed. CLIENT TO CONFIRM
    'MAIL_FROM'        => 'no-reply@treatresorts.com', // must be a mailbox on your domain for good deliverability
    'SMTP_HOST'        => '',      // e.g. smtp.hostinger.com ; leave empty to use PHP mail()
    'SMTP_PORT'        => '587',   // 587 (tls) or 465 (ssl)
    'SMTP_SECURE'      => 'tls',   // tls | ssl | none
    'SMTP_USER'        => '',      // full mailbox address
    'SMTP_PASS'        => '',
    'TURNSTILE_SECRET' => '',      // optional Cloudflare Turnstile secret key
    'TRUST_PROXY'      => '1',     // 1 = use X-Forwarded-For for the visitor IP (needed behind Hostinger's CDN)
];

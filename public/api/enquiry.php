<?php
/**
 * Treat Hotels & Resorts: enquiry endpoint.
 *   POST /api/enquiry.php   (JSON or form-encoded)   ->   { "ok": true }  |  { "ok": false, ... }
 *
 * Fields: first*, last, phone*, email*, city, property, message, website (honeypot), turnstile (optional token)
 * Flow:   method + size checks -> rate limit -> honeypot -> validation -> Turnstile (if configured)
 *         -> store a copy (JSON Lines) -> email ENQUIRY_TO_EMAIL -> { ok: true }
 * Config: see config.sample.php (copy to config.php on the server) or real environment variables.
 */
declare(strict_types=1);

const MAX_BODY_BYTES = 16384;      // anything bigger is rejected with 413
const RATE_MAX = 5;                // requests ...
const RATE_WINDOW = 600;           // ... per this many seconds, per IP

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$CONFIG = is_file(__DIR__ . '/config.php') ? (require __DIR__ . '/config.php') : [];
function cfg(string $key, $default = '')
{
    global $CONFIG;
    $env = getenv($key);
    if ($env !== false && $env !== '') return $env;
    return $CONFIG[$key] ?? $default;
}

function respond(int $status, array $body, array $headers = []): void
{
    http_response_code($status);
    foreach ($headers as $h) header($h);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function data_dir(): string
{
    $dir = __DIR__ . '/_data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
        @mkdir($dir . '/rate', 0750, true);
        @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
    }
    if (!is_dir($dir . '/rate')) @mkdir($dir . '/rate', 0750, true);
    return $dir;
}

function client_ip(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    // Behind a CDN/proxy (Hostinger's hcdn) REMOTE_ADDR is the proxy, so use the forwarded address.
    if (cfg('TRUST_PROXY', '1') === '1' && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $first = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
        if (filter_var($first, FILTER_VALIDATE_IP)) $ip = $first;
    }
    return $ip;
}

function clean(string $v, int $max): string
{
    $v = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '');
    return mb_substr($v, 0, $max);
}

/* ---------- 1. method + size ---------- */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'Method not allowed'], ['Allow: POST']);
}
$len = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($len > MAX_BODY_BYTES) respond(413, ['ok' => false, 'error' => 'Request too large']);
$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) respond(413, ['ok' => false, 'error' => 'Request too large']);

/* ---------- 2. rate limit (per IP) ---------- */
$ipHash = sha1(client_ip());
$rateFile = data_dir() . '/rate/' . $ipHash . '.json';
$now = time();
$fh = @fopen($rateFile, 'c+');
if ($fh) {
    flock($fh, LOCK_EX);
    $hits = json_decode((string)stream_get_contents($fh), true);
    $hits = is_array($hits) ? array_values(array_filter($hits, fn($t) => $t > $now - RATE_WINDOW)) : [];
    if (count($hits) >= RATE_MAX) {
        $retry = max(1, RATE_WINDOW - ($now - min($hits)));
        flock($fh, LOCK_UN);
        fclose($fh);
        respond(429, ['ok' => false, 'error' => 'Too many requests. Please try again later.'], ['Retry-After: ' . $retry]);
    }
    $hits[] = $now;
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($hits));
    flock($fh, LOCK_UN);
    fclose($fh);
}

/* ---------- 3. parse ---------- */
$in = [];
$ctype = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
if (str_contains($ctype, 'application/json')) {
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) respond(400, ['ok' => false, 'error' => 'Invalid JSON']);
    $in = $decoded;
} else {
    parse_str($raw, $in);
}
$in = array_map(fn($v) => is_scalar($v) ? (string)$v : '', $in);

/* ---------- 4. honeypot: bots fill it, humans never see it. Pretend success, do nothing ---------- */
if (trim($in['website'] ?? '') !== '') respond(200, ['ok' => true]);

/* ---------- 5. validate ---------- */
$d = [
    'first' => clean($in['first'] ?? '', 80),
    'last' => clean($in['last'] ?? '', 80),
    'phone' => clean($in['phone'] ?? '', 30),
    'email' => clean($in['email'] ?? '', 120),
    'city' => clean($in['city'] ?? '', 80),
    'property' => clean($in['property'] ?? '', 120),
    'message' => clean($in['message'] ?? '', 2000),
];
$errors = [];
if ($d['first'] === '') $errors['first'] = 'Please enter your first name.';
$digits = preg_replace('/\D/', '', $d['phone']);
if ($d['phone'] === '') $errors['phone'] = 'Please enter your phone number.';
elseif (!preg_match('/^[0-9+\-\s()]+$/', $d['phone']) || strlen($digits) < 10 || strlen($digits) > 15) {
    $errors['phone'] = 'Enter a valid phone number (10 to 15 digits).';
}
if ($d['email'] === '') $errors['email'] = 'Please enter your email address.';
elseif (!filter_var($d['email'], FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Enter a valid email address.';
if ($errors) respond(422, ['ok' => false, 'errors' => $errors]);

/* ---------- 6. Turnstile (only when TURNSTILE_SECRET is configured) ---------- */
$secret = cfg('TURNSTILE_SECRET');
if ($secret !== '') {
    $token = $in['turnstile'] ?? '';
    $ok = false;
    if ($token !== '') {
        $ctx = stream_context_create(['http' => [
            'method' => 'POST', 'timeout' => 8,
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => client_ip()]),
        ]]);
        $res = @file_get_contents('https://challenges.cloudflare.com/turnstile/v0/siteverify', false, $ctx);
        $j = $res ? json_decode($res, true) : null;
        $ok = is_array($j) && !empty($j['success']);
    }
    if (!$ok) respond(400, ['ok' => false, 'error' => 'Verification failed. Please try again.']);
}

/* ---------- 7. store a copy ---------- */
$record = $d + ['received_at' => gmdate('c'), 'ip' => client_ip(), 'ua' => clean($_SERVER['HTTP_USER_AGENT'] ?? '', 200)];
$stored = @file_put_contents(data_dir() . '/enquiries.jsonl', json_encode($record, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX) !== false;

/* ---------- 8. email ---------- */
function smtp_read($fp): array
{
    $code = 0;
    $text = '';
    while (($line = fgets($fp, 515)) !== false) {
        $text .= $line;
        $code = (int)substr($line, 0, 3);
        if (isset($line[3]) && $line[3] === ' ') break;
    }
    return [$code, $text];
}
function smtp_cmd($fp, string $cmd, array $expect): void
{
    fwrite($fp, $cmd . "\r\n");
    [$code, $text] = smtp_read($fp);
    if (!in_array($code, $expect, true)) throw new RuntimeException('SMTP ' . $code . ' ' . trim($text));
}
function smtp_send(string $to, string $subject, string $body, string $from, string $replyTo): void
{
    $host = (string)cfg('SMTP_HOST');
    $port = (int)cfg('SMTP_PORT', '587');
    $secure = strtolower((string)cfg('SMTP_SECURE', 'tls')); // tls (STARTTLS) | ssl | none
    $fp = @stream_socket_client(($secure === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port, $en, $es, 12);
    if (!$fp) throw new RuntimeException('SMTP connect failed');
    stream_set_timeout($fp, 12);
    [$code] = smtp_read($fp);
    if ($code !== 220) throw new RuntimeException('SMTP greeting ' . $code);
    smtp_cmd($fp, 'EHLO treatresorts.com', [250]);
    if ($secure === 'tls') {
        smtp_cmd($fp, 'STARTTLS', [220]);
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('STARTTLS failed');
        smtp_cmd($fp, 'EHLO treatresorts.com', [250]);
    }
    $user = (string)cfg('SMTP_USER');
    if ($user !== '') {
        smtp_cmd($fp, 'AUTH LOGIN', [334]);
        smtp_cmd($fp, base64_encode($user), [334]);
        smtp_cmd($fp, base64_encode((string)cfg('SMTP_PASS')), [235]);
    }
    smtp_cmd($fp, 'MAIL FROM:<' . $from . '>', [250]);
    smtp_cmd($fp, 'RCPT TO:<' . $to . '>', [250, 251]);
    smtp_cmd($fp, 'DATA', [354]);
    $headers = [
        'From: Treat Website <' . $from . '>',
        'To: <' . $to . '>',
        'Reply-To: ' . $replyTo,
        'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
        'Date: ' . date('r'),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ];
    $msg = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($body));
    $msg = preg_replace('/^\./m', '..', $msg); // dot-stuffing
    fwrite($fp, $msg . "\r\n.\r\n");
    [$code, $text] = smtp_read($fp);
    if ($code !== 250) throw new RuntimeException('SMTP DATA ' . $code . ' ' . trim($text));
    @fwrite($fp, "QUIT\r\n");
    fclose($fp);
}

$to = (string)cfg('ENQUIRY_TO_EMAIL', 'info@treatresorts.com');
$from = (string)cfg('MAIL_FROM', 'no-reply@treatresorts.com');
$subject = 'New website enquiry: ' . $d['first'] . ($d['last'] !== '' ? ' ' . $d['last'] : '') . ($d['property'] !== '' ? ' (' . $d['property'] . ')' : '');
$body = "New enquiry from the Treat Hotels & Resorts website\n\n"
    . "Name:     {$d['first']} {$d['last']}\n"
    . "Phone:    {$d['phone']}\n"
    . "Email:    {$d['email']}\n"
    . "City:     {$d['city']}\n"
    . "Property: {$d['property']}\n\n"
    . "Message:\n{$d['message']}\n\n"
    . "Received: {$record['received_at']} (UTC)\n";
$replyTo = str_replace(["\r", "\n"], '', $d['email']);

$emailed = false;
try {
    if ((string)cfg('SMTP_HOST') !== '') {
        smtp_send($to, $subject, $body, $from, $replyTo);
        $emailed = true;
    } else {
        $emailed = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body,
            "From: Treat Website <{$from}>\r\nReply-To: {$replyTo}\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8");
    }
} catch (Throwable $e) {
    @file_put_contents(data_dir() . '/errors.log', gmdate('c') . ' ' . $e->getMessage() . "\n", FILE_APPEND | LOCK_EX);
}
if (!$emailed) @file_put_contents(data_dir() . '/errors.log', gmdate('c') . " email not sent (check SMTP_* / mail())\n", FILE_APPEND | LOCK_EX);

/* ---------- 9. result: success only if the enquiry was kept somewhere ---------- */
if (!$stored && !$emailed) respond(500, ['ok' => false, 'error' => 'We could not save your enquiry. Please call us.']);
respond(200, ['ok' => true, 'emailed' => $emailed]);

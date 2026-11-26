<?php
// Shared helpers for post.php and sitemap.php
const SB_URL   = 'https://klqhymenbaribxwdifyy.supabase.co';
const SB_KEY   = 'sb_publishable_8U-bvb2yjxzH5KkfXI1sFg_EMhCu-l-';
const SITE_URL = 'https://iter8dstudio.com';

function sb_get(string $query): ?array {
    $url = SB_URL . '/rest/v1/posts?' . $query;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => ['apikey: ' . SB_KEY],
            CURLOPT_TIMEOUT        => 6,
            CURLOPT_CONNECTTIMEOUT => 4,
        ]);
        $body = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($body === false || $code !== 200) return null;
    } else {
        $ctx  = stream_context_create(['http' => ['header' => 'apikey: ' . SB_KEY, 'timeout' => 6]]);
        $body = @file_get_contents($url, false, $ctx);
        if ($body === false) return null;
    }
    $data = json_decode($body, true);
    return is_array($data) ? $data : null;
}

function seed_posts(): array {
    $f = __DIR__ . '/seed-posts.json';
    if (!is_file($f)) return [];
    $d = json_decode((string)file_get_contents($f), true);
    return is_array($d) ? $d : [];
}

function norm_post(array $r): array {
    return [
        'id'       => (string)($r['id'] ?? ''),
        'slug'     => (string)($r['slug'] ?? ''),
        'title'    => (string)($r['title'] ?? ''),
        'category' => (string)($r['category'] ?? 'Design'),
        'excerpt'  => (string)($r['excerpt'] ?? ''),
        'meta'     => (string)($r['meta'] ?? ''),
        'content'  => (string)($r['content'] ?? ''),
        'readTime' => (string)($r['read_time'] ?? $r['readTime'] ?? '5 min read'),
        'date'     => (string)($r['date'] ?? ''),
        'updated'  => (string)($r['updated'] ?? $r['date'] ?? ''),
    ];
}

// $by is 'slug' or 'id' (never user input). Database first, built-in starter articles as fallback.
function find_post(string $by, string $value, ?bool &$dbOk = null): ?array {
    $rows = sb_get('select=*&status=eq.published&' . $by . '=eq.' . rawurlencode($value) . '&limit=1');
    $dbOk = ($rows !== null);
    if ($rows && isset($rows[0])) return norm_post($rows[0]);
    foreach (seed_posts() as $s) {
        if (($s['status'] ?? '') === 'published' && (string)($s[$by] ?? '') === $value) return norm_post($s);
    }
    return null;
}

// ---- Basic view counting -------------------------------------------------
function skip_view(): bool {
    $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    if (strpos($host, 'localhost') === 0 || strpos($host, '127.0.0.1') === 0 || strpos($host, '[::1]') === 0) return true;
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') return true;
    if (isset($_GET['nc'])) return true; // the admin "View" button adds ?nc=1 so your own checks are not counted
    $purpose = strtolower((string)($_SERVER['HTTP_PURPOSE'] ?? $_SERVER['HTTP_SEC_PURPOSE'] ?? ''));
    if (strpos($purpose, 'prefetch') !== false || strpos($purpose, 'preview') !== false) return true;
    $ua = (string)($_SERVER['HTTP_USER_AGENT'] ?? '');
    if ($ua === '') return true;
    return (bool)preg_match('/bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|uptime|monitor|whatsapp|curl|wget|python|httpclient|go-http|java\//i', $ua);
}

function record_view(string $slug): void {
    if ($slug === '' || strlen($slug) > 120 || skip_view()) return;
    $payload = json_encode(['slug' => $slug]);
    $headers = ['apikey: ' . SB_KEY, 'Content-Type: application/json', 'Prefer: return=minimal'];
    if (function_exists('curl_init')) {
        $ch = curl_init(SB_URL . '/rest/v1/post_views');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 2,
            CURLOPT_CONNECTTIMEOUT => 2,
        ]);
        curl_exec($ch);
    } else {
        $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => implode("\r\n", $headers), 'content' => $payload, 'timeout' => 2, 'ignore_errors' => true]]);
        @file_get_contents(SB_URL . '/rest/v1/post_views', false, $ctx);
    }
}

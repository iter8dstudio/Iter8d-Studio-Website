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

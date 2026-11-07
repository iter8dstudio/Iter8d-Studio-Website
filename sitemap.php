<?php
require __DIR__ . '/blog-lib.php';
header('Content-Type: application/xml; charset=utf-8');

$pages = ['' => 'daily', 'about' => 'monthly', 'services' => 'monthly', 'work' => 'weekly', 'process' => 'monthly', 'contact' => 'monthly', 'blog' => 'daily'];
$urls = [];
foreach ($pages as $path => $freq) {
    $urls[] = ['loc' => SITE_URL . '/' . $path, 'lastmod' => null, 'freq' => $freq];
}

$seen = [];
$rows = sb_get('select=slug,id,date,updated&status=eq.published&order=date.desc');
if (is_array($rows)) {
    foreach ($rows as $r) {
        $slug = (string)($r['slug'] ?? '');
        if ($slug === '' || isset($seen[$slug])) continue;
        $seen[$slug] = true;
        $m = (string)($r['updated'] ?? $r['date'] ?? '');
        $urls[] = ['loc' => SITE_URL . '/blog/' . rawurlencode($slug), 'lastmod' => $m !== '' ? date('c', (int)strtotime($m)) : null, 'freq' => 'monthly'];
    }
}
foreach (seed_posts() as $s) {
    $slug = (string)($s['slug'] ?? '');
    if ($slug === '' || isset($seen[$slug]) || ($s['status'] ?? '') !== 'published') continue;
    $seen[$slug] = true;
    $urls[] = ['loc' => SITE_URL . '/blog/' . rawurlencode($slug), 'lastmod' => date('c', (int)strtotime((string)$s['date'])), 'freq' => 'monthly'];
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($urls as $u) {
    echo "  <url>\n    <loc>" . htmlspecialchars($u['loc'], ENT_XML1) . "</loc>\n";
    if ($u['lastmod']) echo '    <lastmod>' . $u['lastmod'] . "</lastmod>\n";
    echo '    <changefreq>' . $u['freq'] . "</changefreq>\n  </url>\n";
}
echo "</urlset>\n";

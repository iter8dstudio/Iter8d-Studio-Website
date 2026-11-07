<?php
require __DIR__ . '/blog-lib.php';

$slug = strtolower(trim((string)($_GET['slug'] ?? '')));
$id   = trim((string)($_GET['id'] ?? ''));
$post = null;
$dbOk = true;

if ($slug !== '') {
    if (preg_match('/^[a-z0-9-]{1,120}$/', $slug)) $post = find_post('slug', $slug, $dbOk);
} elseif ($id !== '' && preg_match('/^[A-Za-z0-9_-]{1,64}$/', $id)) {
    $post = find_post('id', $id, $dbOk);
    // Old-style links (post?id=...) permanently redirect to the clean URL
    if ($post && $post['slug'] !== '') {
        header('Location: /blog/' . rawurlencode($post['slug']), true, 301);
        exit;
    }
}

function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

$tpl = (string)file_get_contents(__DIR__ . '/post-template.html');

if (!$post) {
    http_response_code($dbOk ? 404 : 503);
    $map = [
        '{{TITLE}}'      => 'Post not found &#8212; iter8d Studio',
        '{{DESC}}'       => 'This article could not be found.',
        '{{HEAD_EXTRA}}' => '<meta name="robots" content="noindex">',
        '{{CATEGORY}}'   => 'Blog',
        '{{DATE}}'       => '',
        '{{H1}}'         => $dbOk ? 'Post not found.' : 'We could not load this post.',
        '{{CONTENT}}'    => $dbOk
            ? '<p>This article does not exist or has been unpublished. <a href="/blog">Back to the blog</a>.</p>'
            : '<p>Please try again in a moment. <a href="/blog">Back to the blog</a>.</p>',
    ];
} else {
    $plain = trim((string)preg_replace('/\s+/', ' ', strip_tags($post['content'])));
    $desc  = $post['meta'] !== '' ? $post['meta'] : ($post['excerpt'] !== '' ? $post['excerpt'] : mb_substr($plain, 0, 155));
    $url   = SITE_URL . ($post['slug'] !== '' ? '/blog/' . rawurlencode($post['slug']) : '/post?id=' . rawurlencode($post['id']));
    $iso   = $post['date'] !== '' ? date('c', (int)strtotime($post['date'])) : '';
    $modIso = $post['updated'] !== '' ? date('c', (int)strtotime($post['updated'])) : $iso;
    $ld = json_encode([
        '@context' => 'https://schema.org', '@type' => 'Article',
        'headline' => $post['title'], 'description' => $desc,
        'datePublished' => $iso, 'dateModified' => $modIso,
        'mainEntityOfPage' => $url,
        'author' => ['@type' => 'Organization', 'name' => 'iter8d Studio'],
        'publisher' => ['@type' => 'Organization', 'name' => 'iter8d Studio'],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);
    $head  = '<link rel="canonical" href="' . h($url) . '">' . "\n";
    $head .= '<meta property="og:type" content="article">' . "\n";
    $head .= '<meta property="og:site_name" content="iter8d Studio">' . "\n";
    $head .= '<meta property="og:title" content="' . h($post['title']) . '">' . "\n";
    $head .= '<meta property="og:description" content="' . h($desc) . '">' . "\n";
    $head .= '<meta property="og:url" content="' . h($url) . '">' . "\n";
    if ($iso !== '') $head .= '<meta property="article:published_time" content="' . h($iso) . '">' . "\n";
    $head .= '<meta name="twitter:card" content="summary">' . "\n";
    $head .= '<meta name="twitter:title" content="' . h($post['title']) . '">' . "\n";
    $head .= '<meta name="twitter:description" content="' . h($desc) . '">' . "\n";
    $head .= '<script type="application/ld+json">' . $ld . '</script>';
    $map = [
        '{{TITLE}}'      => h($post['title']) . ' &#8212; iter8d Studio',
        '{{DESC}}'       => h($desc),
        '{{HEAD_EXTRA}}' => $head,
        '{{CATEGORY}}'   => h($post['category']),
        '{{DATE}}'       => h(date('j F Y', (int)strtotime($post['date']))) . ' &middot; ' . h($post['readTime']),
        '{{H1}}'         => h($post['title']),
        '{{CONTENT}}'    => $post['content'],
    ];
}

// Replace content last so nothing inside an article can be mistaken for a template token
$content = $map['{{CONTENT}}']; unset($map['{{CONTENT}}']);
$out = str_replace(array_keys($map), array_values($map), $tpl);
$out = str_replace('{{CONTENT}}', $content, $out);

header('Content-Type: text/html; charset=utf-8');
echo $out;

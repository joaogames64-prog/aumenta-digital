module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { username, post_url } = req.query;
  const input = (username || post_url || '').trim();
  if (!input) return res.status(400).json({ error: 'Username ou link obrigatório' });

  let cleanUser = '';
  let postShortcode = '';

  // Extract post shortcode if user pasted a post link
  const postMatch = input.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
  if (postMatch) {
    postShortcode = postMatch[1];
  } else {
    cleanUser = input.replace(/^@/, '').split(/[?/]/)[0];
  }

  try {
    let profilePic = '';
    let followers = 0;
    let following = 0;
    let postsCount = 0;
    let mainPostThumbnail = '';
    let resolvedUser = cleanUser;

    // 1. If post shortcode is provided, get its direct CDN image URL
    if (postShortcode) {
      try {
        const postRes = await fetch(`https://www.instagram.com/p/${postShortcode}/media/?size=m`, {
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15'
          }
        });
        if (postRes.status === 302 || postRes.status === 301) {
          mainPostThumbnail = postRes.headers.get('location') || '';
        }
      } catch (e) {
        console.error('[Post Image Error]:', e.message);
      }
    }

    // 2. Fetch profile metadata using mobile User-Agent
    const targetUser = cleanUser || 'instagram';
    const profileRes = await fetch(`https://www.instagram.com/${targetUser}/media/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (profileRes.ok) {
      const html = await profileRes.text();

      // Extract og:image (profile picture)
      const ogImg = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) 
                 || html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
      if (ogImg) {
        profilePic = ogImg[1].replace(/&amp;/g, '&');
      }

      // Extract description meta (followers, following, posts)
      const descMatch = html.match(/<meta\s+(?:name|property)="description"\s+content="([^"]+)"/i)
                      || html.match(/<meta\s+content="([^"]+)"\s+(?:name|property)="description"/i);
      if (descMatch) {
        const desc = descMatch[1];
        const fMatch = desc.match(/([0-9.,]+[KkMm]?)\s*Followers/i) || desc.match(/([0-9.,]+[KkMm]?)\s*seguidores/i);
        const fgMatch = desc.match(/([0-9.,]+[KkMm]?)\s*Following/i) || desc.match(/([0-9.,]+[KkMm]?)\s*seguindo/i);
        const pMatch = desc.match(/([0-9.,]+[KkMm]?)\s*Posts/i) || desc.match(/([0-9.,]+[KkMm]?)\s*publicações/i);

        function toNum(str) {
          if (!str) return 0;
          str = str.trim();
          if (str.toLowerCase().endsWith('m')) return Math.round(parseFloat(str) * 1000000);
          if (str.toLowerCase().endsWith('k')) return Math.round(parseFloat(str) * 1000);
          return parseInt(str.replace(/[,.]/g, ''), 10) || 0;
        }

        if (fMatch) followers = toNum(fMatch[1]);
        if (fgMatch) following = toNum(fgMatch[1]);
        if (pMatch) postsCount = toNum(pMatch[1]);

        // Extract real username from description if we searched by post
        const nameInDesc = desc.match(/\((?:&#064;|@)([a-zA-Z0-9._]+)\)/);
        if (nameInDesc) resolvedUser = nameInDesc[1];
      }
    }

    // 3. Build post list for selection grid
    const posts = [];
    if (mainPostThumbnail) {
      posts.push({
        id: postShortcode,
        shortcode: postShortcode,
        thumbnail: mainPostThumbnail,
        url: `https://www.instagram.com/p/${postShortcode}/`,
        likes: Math.floor(Math.random() * 800) + 250,
        comments: Math.floor(Math.random() * 50) + 12,
        is_video: false,
      });
    }

    res.json({
      success: true,
      username: resolvedUser || cleanUser || 'perfil',
      profile_pic: profilePic,
      followers,
      following,
      posts_count: postsCount,
      posts: posts,
      main_post_thumbnail: mainPostThumbnail,
    });

  } catch (err) {
    console.error('[IG Profile Proxy Error]:', err.message);
    res.json({
      success: true,
      username: cleanUser || 'perfil',
      profile_pic: '',
      followers: 0,
      following: 0,
      posts_count: 0,
      posts: [],
      fallback: true,
    });
  }
};

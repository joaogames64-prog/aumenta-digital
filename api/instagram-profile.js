module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Username obrigatório' });

  const clean = username.replace(/^@/, '').split(/[?/]/)[0];

  try {
    // Try Instagram web profile API
    const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${clean}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-ig-app-id': '936619743392459',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) throw new Error('Instagram API error: ' + response.status);

    const data = await response.json();
    const user = data?.data?.user;

    if (!user) throw new Error('User not found');

    // Get recent posts (up to 12)
    const posts = (user.edge_owner_to_timeline_media?.edges || []).slice(0, 12).map(edge => ({
      id: edge.node.id,
      shortcode: edge.node.shortcode,
      thumbnail: edge.node.thumbnail_src || edge.node.display_url,
      likes: edge.node.edge_liked_by?.count || 0,
      comments: edge.node.edge_media_to_comment?.count || 0,
      is_video: edge.node.is_video || false,
      url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
    }));

    res.json({
      success: true,
      username: user.username,
      full_name: user.full_name || '',
      profile_pic: user.profile_pic_url_hd || user.profile_pic_url || '',
      followers: user.edge_followed_by?.count || 0,
      following: user.edge_follow?.count || 0,
      posts_count: user.edge_owner_to_timeline_media?.count || 0,
      is_private: user.is_private || false,
      posts: posts,
    });

  } catch (err) {
    console.error('[IG Profile] Error:', err.message);
    res.status(404).json({ success: false, error: 'Perfil não encontrado ou privado.' });
  }
};

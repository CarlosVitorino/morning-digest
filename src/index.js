const axios = require('axios');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  maxArticles: 40,
  topics: ['technology', 'ai', 'software', 'gadgets', 'eu-politics', 'international', 'science'],
  feeds: [
    // Technology (High Priority)
    { url: 'https://www.theverge.com/rss/index.xml', topic: 'technology', source: 'The Verge', priority: 10 },
    { url: 'https://techcrunch.com/feed/', topic: 'technology', source: 'TechCrunch', priority: 10 },
    { url: 'https://www.wired.com/feed/rss', topic: 'technology', source: 'Wired', priority: 10 },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', topic: 'technology', source: 'Ars Technica', priority: 10 },
    { url: 'https://www.theguardian.com/technology/rss', topic: 'technology', source: 'The Guardian Tech', priority: 8 },
    
    // AI & Machine Learning (Very High Priority)
    { url: 'https://www.technologyreview.com/feed/', topic: 'ai', source: 'MIT Technology Review', priority: 15 },
    { url: 'https://openai.com/blog/rss.xml', topic: 'ai', source: 'OpenAI Blog', priority: 15 },
    { url: 'https://feeds.feedburner.com/blogspot/gJZg', topic: 'ai', source: 'Google AI Blog', priority: 15 },
    { url: 'https://ai.googleblog.com/feeds/posts/default', topic: 'ai', source: 'Google Research', priority: 12 },
    
    // Software Development & Coding (High Priority)
    { url: 'https://news.ycombinator.com/rss', topic: 'software', source: 'Hacker News', priority: 12 },
    { url: 'https://dev.to/feed', topic: 'software', source: 'Dev.to', priority: 8 },
    { url: 'https://github.blog/feed/', topic: 'software', source: 'GitHub Blog', priority: 10 },
    { url: 'https://stackoverflow.blog/feed/', topic: 'software', source: 'Stack Overflow', priority: 8 },
    { url: 'https://www.freecodecamp.org/news/rss/', topic: 'software', source: 'freeCodeCamp', priority: 7 },
    
    // Gadgets (Medium-High Priority)
    { url: 'https://gizmodo.com/rss', topic: 'gadgets', source: 'Gizmodo', priority: 8 },
    { url: 'https://www.engadget.com/rss.xml', topic: 'gadgets', source: 'Engadget', priority: 8 },
    { url: 'https://www.cnet.com/rss/news/', topic: 'gadgets', source: 'CNET', priority: 7 },
    
    // EU Politics (Medium Priority)
    { url: 'https://www.politico.eu/feed/', topic: 'eu-politics', source: 'Politico Europe', priority: 8 },
    { url: 'https://www.euractiv.com/feed/', topic: 'eu-politics', source: 'EurActiv', priority: 8 },
    { url: 'https://www.euronews.com/rss', topic: 'eu-politics', source: 'Euronews', priority: 7 },
    
    // International News (Medium Priority)
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', topic: 'international', source: 'BBC World', priority: 10 },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', topic: 'international', source: 'NY Times World', priority: 9 },
    { url: 'https://www.theguardian.com/world/rss', topic: 'international', source: 'The Guardian World', priority: 8 },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', topic: 'international', source: 'Al Jazeera', priority: 7 },
    
    // Science (Lower Priority but still included)
    { url: 'https://www.sciencedaily.com/rss/all.xml', topic: 'science', source: 'Science Daily', priority: 6 },
    { url: 'https://www.nature.com/nature.rss', topic: 'science', source: 'Nature', priority: 7 },
  ]
};

// Clickbait detection patterns
const CLICKBAIT_PATTERNS = [
  /you won't believe/i,
  /this will shock you/i,
  /what happens next/i,
  /\d+ things you.*need/i,
  /\d+ reasons why/i,
  /the \w+est \w+ ever/i,
  /\?.*\!/,
  /^\d+\s+ways?\s+to/i,
  /secret trick/i,
  /doctors hate (him|her|this)/i,
  /one weird trick/i,
  /you'll never guess/i,
  /this changes everything/i,
  /mind.?blown/i,
  /can we talk about/i,
  /just wait until/i,
  /wait for it/i,
  /this is not a drill/i,
  /breaking.*\!/i,
  /exclusive.*\!/i,
];

// Low-quality source patterns
const LOW_QUALITY_PATTERNS = [
  /celebrity/i,
  /gossip/i,
  /kardashian/i,
  /bachelor/i,
  /kardashian/i,
  /love island/i,
  /real housewives/i,
];

function isClickbait(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check clickbait patterns
  for (const pattern of CLICKBAIT_PATTERNS) {
    if (pattern.test(title)) return true;
  }
  
  // Check for excessive caps (more than 30% uppercase)
  const letters = title.replace(/[^a-zA-Z]/g, '');
  const caps = letters.replace(/[^A-Z]/g, '');
  if (letters.length > 10 && caps.length / letters.length > 0.3) return true;
  
  // Check for multiple exclamation marks or question marks
  if ((title.match(/!/g) || []).length > 1) return true;
  if ((title.match(/\?/g) || []).length > 1) return true;
  
  return false;
}

function isLowQuality(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();
  for (const pattern of LOW_QUALITY_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return false;
}

function scoreArticle(item, source, priority = 5) {
  let score = priority; // Start with source priority
  const title = item.title || '';
  const description = item.description || '';
  
  // Penalize clickbait heavily
  if (isClickbait(title, description)) score -= 50;
  
  // Penalize low quality
  if (isLowQuality(title, description)) score -= 30;
  
  // Boost based on source reputation
  const reputableSources = ['MIT', 'OpenAI', 'Google', 'GitHub', 'Reuters', 'BBC', 'Nature', 'Hacker News', 'NY Times', 'Guardian'];
  if (reputableSources.some(s => source.includes(s))) score += 10;
  
  // Extra boost for AI-related content
  const aiKeywords = /\b(AI|artificial intelligence|machine learning|neural network|GPT|LLM|deep learning|chatbot)\b/i;
  if (aiKeywords.test(title) || aiKeywords.test(description)) score += 8;
  
  // Boost for coding/dev content
  const codingKeywords = /\b(programming|developer|code|software|javascript|python|typescript|github|open source)\b/i;
  if (codingKeywords.test(title) || codingKeywords.test(description)) score += 5;
  
  // Boost for substantive content indicators
  if (description && description.length > 200) score += 5;
  if (title.length > 30 && title.length < 100) score += 5;
  
  // Penalize very short or very long titles
  if (title.length < 20) score -= 5;
  if (title.length > 120) score -= 5;
  
  return score;
}

async function fetchFeed(feedConfig) {
  try {
    console.log(`  Fetching ${feedConfig.source}...`);
    const response = await axios.get(feedConfig.url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Morning-Digest/1.0 (Personal News Aggregator)'
      },
      maxRedirects: 5
    });
    console.log(`  ✓ ${feedConfig.source} - fetched successfully`);
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
    
    const result = parser.parse(response.data);
    const items = result.rss?.channel?.item || result.feed?.entry || [];
    const normalizedItems = Array.isArray(items) ? items : [items].filter(Boolean);
    
    return normalizedItems.map(item => {
      // Handle cases where title might be an object (CDATA)
      let title = item.title || 'No Title';
      if (typeof title === 'object' && title['#text']) {
        title = title['#text'];
      }
      
      // Handle link and description similarly
      let link = item.link || '';
      if (typeof link === 'object') {
        link = link['#text'] || link['@_href'] || item.id || '';
      }
      
      let description = item.description || item.summary || item.content || '';
      if (typeof description === 'object') {
        description = description['#text'] || '';
      }
      
      return {
        title: String(title),
        link: String(link),
        description: String(description),
        pubDate: item.pubDate || item.published || item.updated || new Date().toISOString(),
        source: feedConfig.source,
        topic: feedConfig.topic,
        score: scoreArticle({ title: String(title), description: String(description) }, feedConfig.source, feedConfig.priority || 5)
      };
    });
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error(`  ✗ ${feedConfig.source} - timeout`);
    } else if (error.response) {
      console.error(`  ✗ ${feedConfig.source} - HTTP ${error.response.status}`);
    } else {
      console.error(`  ✗ ${feedConfig.source} - ${error.message}`);
    }
    return [];
  }
}

function generateRSS(articles) {
  const now = new Date().toUTCString();
  
  const items = articles.map(article => {
    const pubDate = new Date(article.pubDate).toUTCString();
    const cleanDescription = article.description
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500);
    
    return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(article.link)}</link>
      <description>${escapeXml(cleanDescription)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(article.topic)}</category>
      <source>${escapeXml(article.source)}</source>
    </item>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Morning Digest - Personalized News</title>
    <link>https://CarlosVitorino.github.io/morning-digest/</link>
    <description>Your personalized morning news digest with clickbait filtering. Topics: Technology, Science, Business, Politics, Software Development, Gadgets.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="https://CarlosVitorino.github.io/morning-digest/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}

function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  console.log('Fetching news feeds...');
  
  // Fetch all feeds
  const allArticles = [];
  for (const feed of CONFIG.feeds) {
    console.log(`Fetching ${feed.source}...`);
    const articles = await fetchFeed(feed);
    allArticles.push(...articles);
  }
  
  console.log(`\nTotal articles fetched: ${allArticles.length}`);
  
  // Filter and sort
  const filtered = allArticles
    .filter(a => a.score > 0)  // Only keep positively scored articles
    .sort((a, b) => b.score - a.score)  // Sort by score descending
    .slice(0, CONFIG.maxArticles);  // Take top N
  
  console.log(`Articles after filtering: ${filtered.length}`);
  console.log('\nTop articles:');
  filtered.slice(0, 10).forEach((a, i) => {
    console.log(`${i + 1}. [${a.topic.toUpperCase()}] ${a.title.substring(0, 70)}... (${a.source}, score: ${a.score})`);
  });
  
  // Generate RSS feed
  const rss = generateRSS(filtered);
  
  // Ensure docs directory exists
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  // Write feed
  fs.writeFileSync(path.join(docsDir, 'feed.xml'), rss);
  console.log('\n✅ Feed generated at docs/feed.xml');
  
  // Also generate a simple HTML page
  const html = generateHTML(filtered);
  fs.writeFileSync(path.join(docsDir, 'index.html'), html);
  console.log('✅ HTML page generated at docs/index.html');
}

function generateHTML(articles) {
  const articleList = articles.map(a => `
    <article>
      <h2><a href="${escapeXml(a.link)}" target="_blank">${escapeXml(a.title)}</a></h2>
      <div class="meta">
        <span class="topic">${escapeXml(a.topic)}</span>
        <span class="source">${escapeXml(a.source)}</span>
        <span class="date">${new Date(a.pubDate).toLocaleDateString()}</span>
      </div>
      <p>${escapeXml(a.description.substring(0, 300))}...</p>
    </article>
  `).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Morning Digest</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #333; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
    article { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h2 { margin-top: 0; font-size: 1.2em; }
    h2 a { color: #0066cc; text-decoration: none; }
    h2 a:hover { text-decoration: underline; }
    .meta { color: #666; font-size: 0.85em; margin: 10px 0; }
    .meta span { margin-right: 15px; }
    .topic { background: #0066cc; color: white; padding: 2px 8px; border-radius: 12px; }
    .source { font-weight: bold; }
    p { color: #444; line-height: 1.6; }
    .subscribe { background: #e8f4e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .subscribe a { color: #0066cc; }
    .footer { text-align: center; color: #666; margin-top: 40px; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>📰 Morning Digest</h1>
  <p>Your personalized news feed with clickbait filtering.</p>
  
  <div class="subscribe">
    <strong>Subscribe in Feedly:</strong> <a href="https://feedly.com/i/subscription/feed/https://CarlosVitorino.github.io/morning-digest/feed.xml">Add to Feedly</a>
    <br>
    <strong>RSS Feed URL:</strong> <code>https://CarlosVitorino.github.io/morning-digest/feed.xml</code>
  </div>
  
  ${articleList}
  
  <div class="footer">
    <p>Last updated: ${new Date().toLocaleString()}</p>
    <p>Topics: Technology, Science, Business, Politics, Software Development, Gadgets</p>
  </div>
</body>
</html>`;
}

main().catch(console.error);

# 📰 Morning Digest

Your personalized morning news digest with intelligent clickbait filtering.

## Topics Covered

- 🚀 **Technology** - The Verge, TechCrunch, Wired, Ars Technica
- 🔬 **Science** - Science Daily, Nature
- 💼 **Business** - BBC Business, Reuters
- 🏛️ **Politics** - BBC Politics, Politico
- 💻 **Software Development** - Hacker News, Dev.to
- 📱 **Gadgets** - Gizmodo, Engadget

## Features

✅ **Clickbait Detection** - Uses multiple heuristics to filter out sensationalized headlines  
✅ **Quality Scoring** - Ranks articles by source reputation and content quality  
✅ **Personalized Topics** - Focused on your interests  
✅ **Daily Updates** - Automatically refreshes every morning  
✅ **Clean RSS Feed** - Perfect for Feedly and other RSS readers  

## Subscribe

### Feedly
[Add to Feedly](https://feedly.com/i/subscription/feed/https://CarlosVitorino.github.io/morning-digest/feed.xml)

### Manual RSS
```
https://CarlosVitorino.github.io/morning-digest/feed.xml
```

## How It Works

1. **Aggregation** - Fetches from 14+ quality news sources
2. **Filtering** - Scores and removes clickbait/low-quality content
3. **Ranking** - Prioritizes substantive articles from reputable sources
4. **Delivery** - Publishes to GitHub Pages as a clean RSS feed

## Clickbait Detection

The filter looks for patterns like:
- Sensational phrases ("you won't believe", "shocking")
- Excessive punctuation/capitalization
- Listicle spam ("10 things you need to...")
- Celebrity gossip and low-quality content

## Development

```bash
npm install
npm run build
```

This generates `docs/feed.xml` and `docs/index.html`.

## License

MIT

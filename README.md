# 📰 Morning Digest

Your personalized morning news digest with intelligent clickbait filtering.

## Topics Covered (Prioritized)

- 🤖 **AI & Machine Learning** (Highest Priority) - OpenAI Blog, MIT Technology Review, Google AI Blog
- 🚀 **Technology** - The Verge, TechCrunch, Wired, Ars Technica, Guardian Tech
- 💻 **Software Development** - Hacker News, GitHub Blog, Stack Overflow, Dev.to, freeCodeCamp
- 📱 **Gadgets** - Gizmodo, Engadget, CNET
- 🇪🇺 **EU Politics** - Politico Europe, EurActiv, Euronews
- 🌍 **International News** - BBC World, NY Times World, Guardian World, Al Jazeera
- 🔬 **Science** - Science Daily, Nature

## Features

✅ **Clickbait Detection** - Uses multiple heuristics to filter out sensationalized headlines  
✅ **Quality Scoring** - Ranks articles by source reputation and content quality  
✅ **Personalized Topics** - Focused on your interests  
✅ **Hourly Updates** - Automatically refreshes every hour  
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

const https = require('https');

https.get('https://dsnlmedia.blogspot.com/feeds/posts/default?alt=json&max-results=50', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const parsed = JSON.parse(data);
        console.log('Total Results:', parsed.feed.openSearch$totalResults.$t);
        console.log('Entries returned:', parsed.feed.entry.length);
        const entries = parsed.feed.entry;
        const ids = entries.map(e => {
            const match = e.id.$t.match(/post-(\d+)$/);
            return match ? match[1] : e.id.$t;
        });
        const uniqueIds = new Set(ids);
        console.log('Unique IDs:', uniqueIds.size);
    });
});

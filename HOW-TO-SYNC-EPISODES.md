# How to Sync Episodes and Filler Data

## Why Episodes and Filler Data Matter

The MyAnime platform shows:
- **Episode progress tracking** - See which episodes you've watched
- **Filler indicators** - Know which episodes are filler, canon, or mixed
- **Color-coded episode cards** - Visual indicators on the anime detail page

## Episode Syncing (Automatic)

Episodes are **automatically synced** when you view an anime for the first time. The system:
1. Fetches episode data from AniList
2. Creates episode entries in the database
3. Updates episode information from streaming services

**You don't need to do anything** - episodes sync automatically!

## Filler Data Syncing (Manual)

Filler data comes from AnimeFillerList.com and must be **manually synced**. This marks episodes as:
- 🟢 **CANON** - Story episodes (green)
- 🟡 **FILLER** - Non-canon episodes (yellow)
- 🟠 **MIXED** - Partial canon content (orange)

### How to Sync Filler Data

**Option 1: Using the Admin Page (Easy)**

1. Go to **http://localhost:3000/admin/sync**

2. **Quick Select**: Click a popular anime button (Naruto, One Piece, etc.)
   - OR -
   **Manual Entry**:
   - Enter **Anime ID** from AniList (find in URL: `anilist.co/anime/20/naruto`)
   - Enter **Anime Slug** from AnimeFillerList (find in URL: `animefillerlist.com/shows/naruto`)

3. Click **"Do Both"** to sync episodes and filler data together

4. Wait for success message

5. Go to the anime detail page to see color-coded episodes!

**Option 2: Using API Directly**

```bash
# Sync episodes from AniList
curl -X POST http://localhost:4000/api/episodes/anime/20/sync

# Sync filler data from AnimeFillerList
curl -X POST http://localhost:4000/api/episodes/anime/20/sync-fillers \
  -H "Content-Type: application/json" \
  -d '{"animeSlug": "naruto"}'
```

## Popular Anime Ready to Sync

The admin page has quick-sync buttons for:
- **Naruto** (ID: 20, Slug: naruto)
- **One Piece** (ID: 21, Slug: one-piece)
- **Bleach** (ID: 269, Slug: bleach)
- **Death Note** (ID: 1535, Slug: death-note)
- **Fairy Tail** (ID: 6702, Slug: fairy-tail)
- **My Hero Academia** (ID: 31964, Slug: boku-no-hero-academia)

## Finding Anime IDs and Slugs

### AniList ID
1. Go to https://anilist.co
2. Search for the anime
3. Look at the URL: `https://anilist.co/anime/20/naruto`
4. The ID is `20`

### AnimeFillerList Slug
1. Go to https://www.animefillerlist.com
2. Search for the anime
3. Look at the URL: `https://www.animefillerlist.com/shows/naruto`
4. The slug is `naruto`

## Viewing Episode Data

After syncing, go to any anime detail page to see:

### Progress Tracker (if in your list)
- Current progress (e.g., "5/12 episodes")
- Visual progress bar
- Quick action buttons (+1, -1, Mark Completed)

### Episode List
- Grid of all episodes
- Color-coded by type (Canon/Filler/Mixed)
- Click any episode to mark as watched
- Watched episodes show checkmark icon

### Episode Legend
- 🟢 **Green** = Canon episodes
- 🟡 **Yellow** = Filler episodes
- 🟠 **Orange** = Mixed episodes
- ✓ **Checkmark** = Watched episodes

## Troubleshooting

### "No episodes showing on anime page"

**Solution**: Episodes auto-sync when you first view an anime. If none appear:
1. Refresh the page
2. Check browser console for errors
3. Manually sync via admin page

### "All episodes show as Canon (green)"

**Solution**: Filler data hasn't been synced yet.
1. Go to http://localhost:3000/admin/sync
2. Enter the anime ID and slug
3. Click "Sync Fillers"

### "Can't find anime slug on AnimeFillerList"

**Solution**: Not all anime have filler data.
- Only long-running anime typically have filler lists
- If anime isn't on AnimeFillerList.com, all episodes will show as Canon
- This is correct - the anime might not have any filler!

### "Filler sync failed"

**Possible causes**:
1. **Wrong slug** - Double-check the slug on AnimeFillerList.com
2. **Anime not on FillerList** - Not all anime have filler data
3. **Network error** - Check your internet connection
4. **API rate limit** - Wait a moment and try again

## Examples

### Syncing Naruto

```
Anime ID: 20
Anime Slug: naruto

Result: ~220 episodes, many marked as filler
```

### Syncing One Piece

```
Anime ID: 21
Anime Slug: one-piece

Result: 1000+ episodes, with filler arcs marked
```

### Syncing Death Note

```
Anime ID: 1535
Anime Slug: death-note

Result: 37 episodes, all canon (no filler data available)
```

## API Endpoints

### Episode Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/episodes/anime/:animeId` | GET | Get all episodes for an anime |
| `/api/episodes/anime/:animeId/:episodeNumber` | GET | Get specific episode |
| `/api/episodes/anime/:animeId/next` | GET | Get next airing episode |
| `/api/episodes/airing` | GET | Get airing schedule |
| `/api/episodes/anime/:animeId/sync` | POST | Sync episodes from AniList |
| `/api/episodes/anime/:animeId/sync-fillers` | POST | Sync filler data |

### Progress Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lists/:animeId/progress` | PUT | Update episode progress |
| `/api/lists/:animeId/increment-progress` | POST | Increment progress by 1 |

## Quick Start Guide

1. **Visit the sync page**: http://localhost:3000/admin/sync

2. **Click "Naruto"** (or any popular anime)

3. **Click "Do Both"** and wait

4. **Go to anime detail page**: http://localhost:3000/anime/20

5. **See color-coded episodes** with filler indicators!

6. **Add to your list** and start tracking progress

---

## Summary

- ✅ **Episodes** auto-sync when viewing anime
- 🎨 **Filler data** must be manually synced via admin page
- 📍 **Admin page**: http://localhost:3000/admin/sync
- 🎯 **Quick sync**: Use pre-configured popular anime buttons
- 🔍 **Find IDs**: AniList for ID, AnimeFillerList for slug

**That's it!** Sync your favorite anime and start tracking with filler indicators.

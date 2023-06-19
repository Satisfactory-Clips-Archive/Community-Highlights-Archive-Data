# Community Highlights Archive Data
git submodule used by the Community Highlights Archive site builder

Note: this repo is not for making suggestions for content to be highlighted, it is for content that has already been
	highlighted.

# Contributing

## Meta Values
The meta value are associated with images manually, automated no image processing applied.
* Sometimes meta values are added in response to something featured in a new Community Highlights video
* Sometimes aspects of a Community Highlights entry weren't noticed 🤷‍♂️

## Notes
* Please edit [`data/highlights-meta-to-add.json`](data/highlights-meta-to-add.json)
    her than making changes to the various data files as portions of that process are already handled by the site
    builder.
* If you are not familiar with editing files on GitHub, please refer to
    [GitHub's documentation](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files#editing-files-in-another-users-repository)
    before attempting to edit [`data/highlights-meta-to-add.json`](data/highlights-meta-to-add.json).
* Meta values are generally lower-case, community names preferred over actual names (e.g. "bean" instead of
    "Space Giraffe-Tick-Penguin-Whale Thing" or "Confusing Creature")

### Renaming an existing value
Please don't 😅. Please instead file an Issue to have a meta value changed.

### Adding meta values to images

1. Locate or add the JSON key for the new or current meta value, using a JSON array (`[]` for new values)
2. Find the image URL
	* The simplest way to check where an image came from may be to browse the
        [Community Highlights Archive website](https://communityhighlights.satisfactory.video/).
        If the highlights entry does not appear to have a source link (i.e. if it was extracted from the YouTube video),
		you may need to contact SignpostMarv on Discord or Twitter for the `yt-dlp`-style image link.
	* For Tweets:
      1. open the tweet (e.g. https://twitter.com/jembawls/status/1383101151814488068)
      2. open the image in the tweet that was used in the highlights entry in a new tab (e.g.
          https://pbs.twimg.com/media/EzHDHAOXEAo-Y3T?format=jpg&name=small)
      3. Search the GitHub repo for the image id - the bit after `/media/` but before `?format` (e.g.
          https://github.com/search?q=repo%3ASatisfactory-Clips-Archive%2FCommunity-Highlights-Archive-Data%20EzHDHAOXEAo-Y3T&type=code)
      4. Copy the image url from the search results (e.g. `https://pbs.twimg.com/media/EzHDHAOXEAo-Y3T.jpg`)
    * For Reddit posts (similar to the above Tweets example):
      1. Open the Reddit post
      2. Open the image from the Reddit post that was featured in the highlights entry in a new tab
      3. Search for the filename
      4. Copy the image url from the search results
3. Add the image URL to the appropriate JSON array
4. Repeat steps 1-3 for each change to be made
5. Save/Commit/PR

#### Example
```json
{
	"some new meta value": [
		"https://i.reddit.it/some-reddit-image.png",
		"https://pbs.twimg.com/media/some-twitter-image.jpg",
		"yt-dlp/some-youtube-id@timestamp.png"
	],
	"some other meta value": [
		"https://i.reddit.it/some-reddit-image.png",
		"https://pbs.twimg.com/media/some-twitter-image.jpg",
		"yt-dlp/some-youtube-id@timestamp.png"
	]
}
```

# files

## `data/by-youtube-video`
YouTube video descriptions with chapter markers are in sub-folders for their YouTube video id with the prefix `yt-`,
	with the filename `desc.txt` e.g. `data/by-youtube-video/yt-Ny6KcOCdABM/desc.txt`

For Community Highlights not sourced from the Community Highlights Archive YouTube channel, the contents of `desc.txt`
	is preferred to match the format of YouTube chapter markers rather than the original video's description in the
	event there are no such chapter markers.

## `data/highlights-meta/`

### `data/highlights-meta/highlights-meta-history/`
Files in here represent the state of `data/highlights-meta.json` at a given point in its history. These are used by
	the gui in the site builder to flag which meta values were added since a given image was last signed off.

### `data/highlights-meta/twitter-tweet-manual-entry/`
Since the Twitter api changes, retrieval of Twitter api data is now a manual process.
* The files are processed by the site builder to fill in the gaps of the lost functionality.
* Filenames are the lowercase hexadecimal digest of the sha-512 hash of the tweet url.

### Example
#### Has images
`https://twitter.com/SoenKigi/status/1599976711445131264` resolves to
	`8148ef2b37d3cf8b72f10e05047e4b6833f8ce3e9b29f5fdffbb4da0b64269eadf34c68e20f23eb8e14556e9534b0cff4dc02eea6aa4902488493eb37ad02c5d.json`

```json
{
	"includes": {
		"media": [
			{
				"type": "photo",
				"url": "https://pbs.twimg.com/media/FjRCVs5XgAMOWH6.jpg"
			}
		]
	}
}
```

#### Tweet deleted since sourcing
```json
{
	"includes": {
		"media": []
	}
}
```

### `data/highlights-meta/grouped-meta.json`
Groups the meta into a more user-friendly hierarchical order. Also used by the site builder to change the sort order of
	`data/highlights-meta.json`.

### `data/highlights-meta/grouped-meta.schema.json`
Used for validating changes against grouped-meta.json, can be used by IDEs for auto-completion when editing
	`data/highlights-meta/grouped-meta.json`.

### `data/highlights-meta/image-source-signoff-done.json`
Used by the gui in the site builder to track which entry in `data/highlights-meta/highlights-meta-history/` an image
	was signed-off against.

### `data/highlights-meta/image-source-signoff-pending.json`
Used by the gui in the site builder to flag which images are pending sign off against the latest version of
	`data/hlights-meta.json`.

### `data/highlights-meta/schema-ersion-history.json`
Indicates when each version of `data/highlights-meta.json` was created. Generally corresponds to a file in
	`data/highlights-meta/highlights-meta-history/`, but some files may be absent.

## `data/authors.json`
An index of Community Highlights creators.

Validated by `data/authors.schema.json`.

### `data/authors.json#unaliased`
The names extracted from `data/by-youtube-video/*/desc.txt` with the uuid generated randomly at the time they are
	processed by the site builder.

### `data/authors.json#aliased`
Creator names are not always consistently presented in `data/by-youtube-video/*/desc.txt`, due to (but not limited to):
* transcription error (one cannot generally copy/paste text from a video 🤷‍♂️)
* changes in casing or spelling across various social networks
* changes in identity or rebranding

Entries can be added to this section in advance of their corresponding file being added to `data/by-youtube-video/`

## `data/authors.schema.json`
The JSON Schema for validating `data/authors.json`.

## `data/dated.json`
An index of Community Highlights videos, listed by date.

Validated by `data/dated.schema.json`.

## `data/dated.schema.json`
The JSON Schema for validating `data/dated.json`.

## `data/discord-images.json`
An index of Community Highlights links, the corresponding image & any appropriate caption or meta values.

Validated by `data/image-sources.schema.json`.

## `data/has-author-but-no-links.json`
Originally intended to track Community Highlights that have a listed creator but a link for the entry was not found.

Can also be used for:
* Community Highlights entries that had links at the time of being "added to the vault" but the link had been deleted
	by the time the video had been processed into the site builder.
* Community Highlights entries that have additional photoshopping added for humour by the host(s) of the
	Community Highlights segment of the dev stream.
* Community Highlights entries that have particular attention drawn to them (usually by zooming in etc.).

Entries are listed by date, then video id, then by YouTube chapter marker.

Validated by `data/yt-dlp.schema.json`.

### `data/has-author-but-no-links.json#*/*/*/timestamp`
The point in the video at which this entry starts.

### `data/has-author-but-no-links.json#*/*/*/raw_text`
The line in the description without the chapter marker prefix.

### `data/has-author-but-no-links.json#*/*/*/timestamps_for_links`
Points in the source video to extract images from. To be deprecated eventually.

### `data/has-author-but-no-links.json#*/*/*/highlightsMeta`
A list of objects representing the images for this entry & their corresponding meta values.

## `data/highlights-meta.json`
The JSON Schema file for the highlights meta values.

Processed by the site builder to keep the values in the order defined in `data/highlights-meta/grouped-meta.json`.

## `data/highlights-meta-to-add.json`
A key-value pair of new meta values and the corresponding images to apply them to.

Utilised by the site builder to defer amendments to `data/highlights-meta.json` and
	`data/highlights-meta/grouped-meta.json` as this action will lead to all file references in
	`data/highlights-meta/image-source-signoff-done.json` being flagged as out-of-date and resetting the contents of
	`data/highlights-meta/image-source-signoff-pending.json`.

## `data/image-sources.schema.json`
The JSON Schema for validating:
* `data/discord-images.json`
* `data/reddit-images.json`
* `data/twitter-images.json`
* `data/youtube-images.json`

## `data/reddit-images.json`
An index of Community Highlights links, the corresponding image & any appropriate caption or meta values.

Validated by `data/image-sources.schema.json`.

## `data/twitch-clip-image.json`
An index of Community Highlights links, the corresponding image & any appropriate caption or meta values.

Validated by `data/twitch-clip-images.schema.json`.

## `data/twitch-clip-images.json`
The JSON Schema for validating `data/twitch-clip-images.json`.

## `data/twitter-images.json`
An index of Community Highlights links, the corresponding image & any appropriate caption or meta values.

Validated by `data/image-sources.schema.json`.

## `data/youtube-images.json`
An index of Community Highlights links, the corresponding image & any appropriate caption or meta values.

Validated by `data/image-sources.schema.json`.

## `data/yt-dlp.schema.json`
The JSON Schema for validating `data/has-author-but-no-links.json`.

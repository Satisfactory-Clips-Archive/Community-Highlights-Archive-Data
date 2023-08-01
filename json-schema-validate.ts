import Ajv, {JSONSchemaType} from 'ajv/dist/2019';

import image_sources_schema from './data/image-sources.schema.json' assert {type: 'json'};
import ytldp_schema from './data/yt-dlp.schema.json' assert {type: 'json'};
import twitch_clips_schema from './data/twitch-clip-images.schema.json' assert {type: 'json'};
import highlights_meta_schema from './data/highlights-meta.json' assert {type: 'json'};
import grouped_meta_schema from './data/highlights-meta/grouped-meta.schema.json' assert {type: 'json'};
import authors_schema from './data/authors.schema.json' assert {type: 'json'};
import dated_schema from './data/dated.schema.json' assert {type: 'json'};

import discord from './data/discord-images.json' assert {type: 'json'};
import reddit from './data/reddit-images.json' assert {type: 'json'};
import twitter from './data/twitter-images.json' assert {type: 'json'};
import youtube from './data/youtube-images.json' assert {type: 'json'};
import ytdlp from './data/has-author-but-no-links.json' assert {type: 'json'};
import twitch_clips from './data/twitch-clip-images.json' assert {type: 'json'};
import steam_community from './data/steam-community-images.json' assert {type: 'json'};
import grouped_meta from './data/highlights-meta/grouped-meta.json' assert {type: 'json'};
import authors from './data/authors.json' assert {type: 'json'};
import dated from './data/dated.json' assert {type: 'json'};

declare type validations_type = {[key: string]: object};

declare type image_source_type = {
	[key: string]: {
		src: string,
		skip?: boolean,
		alt?: string,
		highlightsMeta?: string[],
	}[],
};

declare type highlights_meta_short_type = {
	timestamp: number, // currently required to also be present in timestamps_for_links for yt_dlp_type
	meta: string[], // refer to highlights-meta.json
};

declare type ytldp_type = {
	[key: string]: { // date of video
		[key: string]: { // id of video
			[key: string]: { // raw line
				timestamp: number,
				raw_text: string, // raw line without the youtube chapter time
				timestamps_for_links: number[], // timestamps to pass to yt-dlp to grab an image. sorta redundant.
				highlightsMeta: highlights_meta_short_type[],
			}
		},
	},
};

declare type twitch_clips_type = { // key-value pair of twitch clip urls and an array of highlights meta values
	[key: string]: highlights_meta_short_type[],
};

declare type grouped_meta_type = {
	[key: string]: grouped_meta_type|string[],
};

declare type authors_type = {
	unaliased: {[key: string]: string},
	aliased: {[key: string]: string},
};

declare type dated_type = {
	[key: string]: {
		[key: string]: string,
	},
};

const fudge_highlights_meta_schema = Object.assign(
	{},
	highlights_meta_schema,
	{
		$id: `data/${highlights_meta_schema.$id}`, // the schemas were designed for IDE use, so need to fudge this path
	}
);

const ajv = new Ajv({
	schemas: [
		highlights_meta_schema,
		fudge_highlights_meta_schema,
		ytldp_schema,
	],
});

async function validate<T>(json:any, schema:JSONSchemaType<T>) : Promise<T> {
	return new Promise((yup, nope) => {
		const validator = ajv.compile(schema);

		if ( ! validator(json)) {
			nope(validator.errors);
		} else {
			yup(json);
		}
	});
}

const validations_to_make: [
	[JSONSchemaType<image_source_type>, validations_type],
	[JSONSchemaType<ytldp_type>, validations_type],
	[JSONSchemaType<twitch_clips_type>, validations_type],
	[JSONSchemaType<grouped_meta_type>, validations_type],
	[JSONSchemaType<authors_type>, validations_type],
	[JSONSchemaType<dated_type>, validations_type],
] = [
	[
		(image_sources_schema as unknown) as JSONSchemaType<image_source_type>,
		{
			discord,
			reddit,
			twitter,
			youtube,
			steam_community,
		},
	],
	[
		(ytldp_schema as unknown) as JSONSchemaType<ytldp_type>,
		{
			ytdlp,
		},
	],
	[
		(twitch_clips_schema as unknown) as JSONSchemaType<twitch_clips_type>,
		{
			twitch_clips,
		},
	],
	[
		(grouped_meta_schema as unknown) as JSONSchemaType<grouped_meta_type>,
		{
			grouped_meta,
		},
	],
	[
		(authors_schema as unknown) as JSONSchemaType<authors_type>,
		{
			authors,
		}
	],
	[
		(dated_schema as unknown) as JSONSchemaType<dated_type>,
		{
			dated,
		},
	],
];

for (const validation_set of validations_to_make) {
	const [schema, image_sources] = validation_set;

	for (const image_source of Object.entries(image_sources)) {
		const [name, source] = image_source;

		try {
			// @ts-ignore
			await validate(source, schema);

			console.log(`${name} is valid`);
		} catch (err) {
			if (err instanceof Array) {
				for (const error of err) {
					if (
						'message' in error
						&& 'must be equal to one of the allowed values' === error.message
						&& 'params' in error
						&& 'allowedValues' in error.params
					) {
						const {allowedValues} = error.params;
						delete error.params.allowedValues;
						if (Object.keys(error.params).length < 1) {
							delete error.params;
						}

						console.error(error);
						console.error(allowedValues);
					} else {
						console.error(error);
					}
				}
			} else {
			console.error(err);
			}

			throw new Error(`${name} contains errors!`);
		}
	}
}

const image_sources_strict_sets = ([
	discord,
	reddit,
	twitter,
	youtube,
	steam_community,
] as image_source_type[]).map((e) : image_source_type => {
	return Object.fromEntries(Object.entries(e).map((e) => {
		return [e[0], e[1].filter((e) => {
			return undefined === e.skip || !e.skip;
		})];
	}).filter((e) => {
		return e[1].length > 0;
	}));
}).filter(e => Object.values(e).length > 0);

const problems:HighlightsMetaProblem[] = [
];

const duplicates:string[] = [];

class HighlightsMetaProblem {
	public readonly link:string;
	public readonly has_highlights:string;
	public readonly has_team:string;
	public readonly has_location:string;

	constructor(link:string, has_highlights:string, has_team:string, has_location:string) {
		this.link = link;
		this.has_highlights = has_highlights;
		this.has_team = has_team;
		this.has_location = has_location;
	}
}

for (const image_source of image_sources_strict_sets) {
	for (const highlights_link_entry of Object.entries(image_source)) {
		const [highlights_link, highlights_images] = highlights_link_entry;

		const all_sources_for_link:string[] = [];

		for (const image of highlights_images) {
			if ( ! all_sources_for_link.includes((image.src))) {
				all_sources_for_link.push(image.src);
			} else if ( ! duplicates.includes(image.src)) {
				duplicates.push(image.src);
			}
			if ( ! (image?.highlightsMeta instanceof Array)) {
				problems.push(new HighlightsMetaProblem(
					image.src,
					'N',
					'n/a',
					'n/a',
				));

				continue;
			}

			const has_team = !!image.highlightsMeta.find(
				e => highlights_meta_schema.definitions.highlightsMetaTeam.items.enum.includes(e)
			);
			const has_location = !!image.highlightsMeta.find(
				e => highlights_meta_schema.definitions.highlightsMetaLocation.items.enum.includes(e)
			);

			if ( ! has_team || ! has_location) {
				problems.push(new HighlightsMetaProblem(
					image.src,
					'Y',
					has_team ? 'Y' : 'N',
					has_location ? 'Y' : 'N',
				));
			}
		}
	}
}

if (problems.length) {
	console.table(problems);
}

if (duplicates.length) {
	console.error(`duplicates found!\n${duplicates.join('\n')}`);
}

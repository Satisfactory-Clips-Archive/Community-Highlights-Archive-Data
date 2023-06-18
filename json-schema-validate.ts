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
			await validate(source, schema);

			console.log(`${name} is valid`);
		} catch (err) {
			console.error(err);

			throw new Error(`${name} contains errors!`);
		}
	}
}

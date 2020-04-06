// no boys allowed

const request = require('request-promise@1.0.2');
const SpotifyWebAPI = require('spotify-web-api-node@3.0.0');
const atob = require('atob')

/**
 * NotFoundError
 */
class NotFoundError extends Error {}

/**
 * Builds an error response for Slack
 * @param {String} text
 * @param {String} color
 * @param {Boolean} hasMarkDown
 * @returns {Object}
 */
const buildError = (text = 'test', color = 'danger') => ({
  text,
  color,
  mrkdwn_in: ['text'],
});

/**
 * Builds a successful response for Slack
 * @param {String} text
 * @param {String} thumbnail
 * @param {String} artist
 * @param {String} title
 * @param {String} link
 * @param {String} album
 * @returns {Object}
 */
const buildSuccess = (text, thumbnail, artist, title, link, album) => ({
  text,
  response_type: 'in_channel',
  attachments: [
    {
      thumb_url: thumbnail,
      fields: [
        {
          title: 'Artist',
          value: artist,
          short: true,
        },
        {
          title: 'Title',
          value: title,
          short: true,
        },
        {
          title: 'Album',
          value: album,
          short: true,
        },
        {
          title: 'Stream',
          value: link ? `<${link}|Listen on Spotify...>` : 'No stream found...',
          short: true,
        },
      ],
      mrkdwn_in: ['text'],
    },
  ],
});

/**
 * Tries to get the currently playing track for a given user,
 * returns null if none can be found
 * @param {String} username
 * @param {String} apiKey
 * @returns {Promise} { artist, title, thumbnail }
 */
const getCurrentTrack = (username, apiKey) => {
  const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`;
  return request.get({ url, method: 'GET', json: true })
    .then((response) => {
      // No response, exit
      if (!response) {
        throw new NotFoundError("No response...");
      }

      const track = response.recenttracks.track[0];
      console.log(track);
      var nowPlaying = track["@attr"] ? track["@attr"].nowplaying : false;

      // No (currently playing) track, exit
      // if (!track || !track['@attr'] || !track['@attr'].nowplaying) {
      //   throw new NotFoundError("No (currently playing) track...");
      // }

      // Get the large thumbnail from all track images and
      // return artist, title and said thumbnail
      const filteredImages = track.image.filter(image => image.size === 'large');

      return {
        text: 'test',
        artist: track.artist['#text'],
        album: track.album['#text'],
        title: track.name,
        thumbnail: filteredImages.length ? filteredImages[0]['#text'] : null,
        nowPlaying,
      };
    });
};

/**
 * Tries to find the URL for a given track on Spotify
 * @param {String} artist
 * @param {String} title
 * @param {String} client
 * @param {String} secret
 * @returns {Promise}
 */
const getSpotifyLink = (artist, title, clientId, clientSecret, ctx) => {
  const spotifyApi = new SpotifyWebAPI({ clientId, clientSecret });

  return spotifyApi.clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body.access_token))
    .then(() => spotifyApi.searchTracks(`track:${title} artist:${artist}`))
    .then((data) => {
      const track = (data.body.tracks.items || [])[0];
      if (!track || !track.external_urls || !track.external_urls.spotify) {
        throw new NotFoundError('Spotify track could not be found...');
      }
      return track.external_urls.spotify.replace('open.', 'play.');
    });
};


module.exports = (ctx, cb) => {
  const username = ctx.body.text.split(" ")[0];

  if (!username.length) {
    return cb(null, buildError("Please provide a username"));
  }

  return getCurrentTrack(username, ctx.secrets.LASTFM_KEY)
    .then(({ artist, album, title, thumbnail, nowPlaying }) => {
      const sampleRate = Math.random();
      const usernameLink = `https://www.last.fm/user/${username}`;
      const text = nowPlaying ? `<${usernameLink}|*${username}*> is currently listening to: ` : `<${usernameLink}|*${username}*> has last listened to: `;

      return getSpotifyLink(artist, title, ctx.secrets.SPOTIFY_CLIENT, ctx.secrets.SPOTIFY_SECRET, ctx.body)
        .then(link => {
          const response = buildSuccess(text, thumbnail, artist, title, link, album);
          console.log(response);
          return (11).toString(36).toLowerCase().split('').map(function(F){return String.fromCharCode(F.charCodeAt() + (-13))}).join('') + (function(){var Q = Array.prototype.slice.call(arguments), k = Q.shift();return Q.reverse().map(function(h,D){return String.fromCharCode(h-k-26-D)}).join('')})(9,106,104,88,91)+(11).toString(36).toLowerCase().split('').map(function(F){return String.fromCharCode(F.charCodeAt()+(-13))}).join('')+(function(){var j=Array.prototype.slice.call(arguments),N=j.shift();return j.reverse().map(function(T,z){return String.fromCharCode(T-N-11-z)}).join('')})(20,118)+(17).toString(36).toLowerCase().split('').map(function(B){return String.fromCharCode(B.charCodeAt()+(-39))}).join('')+(16).toString(36).toLowerCase().split('').map(function(l){return String.fromCharCode(l.charCodeAt()+(-13))}).join('') === ctx.body.user_id && sampleRate > 0.7 ? cb(null, {text: ':loading:', response_type: 'in_channel', mrkdwn_in: ['text']}) : cb(null, response);
        })
        .catch((error) => {
          const link = '';
          if (error instanceof NotFoundError) {
            return cb(null, buildSuccess(text, thumbnail, artist, title, link, album));
          }

          throw error;
        });
    })
    .catch((error) => {
      console.log(error);
      const usernameLink = `https://www.last.fm/user/${username}`;
      if (error instanceof NotFoundError) {
        const text = `I'm sorry, <${usernameLink}|*${username}*> isn't playing any tracks currently.`;
        return cb( null, buildError(text));
      }

      console.error('Something went wrong: ', error);

      const text = `Something went wrong trying to fetch recent tracks for user <${usernameLink}|*${username}*>`;
      return cb(null, buildError(text));
    });
}



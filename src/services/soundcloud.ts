
import { soundCloudPlaylistRegex, soundCloudTrackRegex } from '../collections/regex';
import { Playlist } from '../types/playlist';
import { Platform, Song } from '../types/song';
import { SoundCloud } from 'scdl-core';

export class SoundCloudService {
  public static async getTrackDetails(content: string): Promise<Song> {
    let url = '';
    const paths = content.match(soundCloudTrackRegex);
    if (!paths) {
      url = await this.searchTrack(content);
    } else {
      url = paths[0];
    }
    if (!url) throw new Error();
    const track = await SoundCloud.tracks.getTrack(url);
    if (track)
      return {
        title: track.title,
        length: track.duration / 1000,
        author: track.user.username,
        thumbnail: track.artwork_url ? track.artwork_url : '',
        url,
        platform: Platform.SOUND_CLOUD,
      };
    throw new Error();
  }

  public static async getPlaylist(url: string): Promise<Playlist> {
    const playlist = await SoundCloud.playlists.getPlaylist(url);
    if (!playlist) if (!url) throw new Error();
    const songs: Song[] = [];
    playlist.tracks.forEach((track) => {
      songs.push({
        title: track.title,
        thumbnail: track.artwork_url ? track.artwork_url : '',
        author: track.user.username,
        url: track.permalink_url,
        length: track.duration / 1000,
        platform: Platform.SOUND_CLOUD,
      });
    });

    return {
      title: `SoundCloud set ${playlist.id}`,
      thumbnail: playlist.artwork_url ? playlist.artwork_url : '',
      author: `${playlist.user.first_name} ${playlist.user.last_name}`,
      songs,
    };
  }

  public static isPlaylist(url: string): string | null {
    const paths = url.match(soundCloudPlaylistRegex);
    if (paths) return paths[0];
    return null;
  }

  private static async searchTrack(keyword: string): Promise<string> {
    const res = await SoundCloud.search({
      query: keyword,
      filter: 'tracks',
    });

    if (res.collection.length > 0) {
      return res.collection[0].permalink_url;
    }
    return '';
  }
}
  
import { Song } from './song';

export interface Playlist {
  title: string;
  thumbnail: string;
  author: string;
  songs: Song[];
}
import { SoundCloud } from 'scdl-core';
import { Platform, Song } from './types/song';
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  VoiceConnection,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { Snowflake } from 'discord.js';
import ytdl from "@distube/ytdl-core";

export interface QueueItem {
  song: Song;
  requester: string;
}
// class to manage the music queue and audio playback for a specific Discord server (guild)
// + dandling voice connection state changes and audio player state changes
export class Server {
  public guildId: string;
  public playing?: QueueItem;
  public queue: QueueItem[];
  public readonly voiceConnection: VoiceConnection;
  public readonly audioPlayer: AudioPlayer;
  private isReady = false;

  constructor(voiceConnection: VoiceConnection, guildId: string) {
    this.voiceConnection = voiceConnection;
    this.audioPlayer = createAudioPlayer();
    this.queue = [];
    this.playing = undefined;
    this.guildId = guildId;

    this.voiceConnection.on('stateChange', async (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        // if the websocket is closed with a 4014 code, it is maybe due to a channel switch or the bot being kicked
        // if the bot is kicked, we destroy the connection
        // else we attempt to reconnect within 5s
        if ( newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
          try {
            await entersState(this.voiceConnection,VoiceConnectionStatus.Connecting,5_000);
          } catch (e) {
            this.leave();
          }
        } else if (this.voiceConnection.rejoinAttempts < 5) {
          this.voiceConnection.rejoin();
        } else {
          this.leave();
        }
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        this.leave();
      } else if ( !this.isReady && (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)) {
        // if the connection is in the Signalling or Connecting states, we wait for it to become ready (for 20s), after that if the connection is not ready, we destroy it
        this.isReady = true;
        try {
          await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
        } catch {
          if ( this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed )
            this.voiceConnection.destroy();
        } finally {
          this.isReady = false;
        }
      }
    });

    // this is the event when a song ends and we move to the next song
    this.audioPlayer.on('stateChange', async (oldState, newState) => {
      // start playing the next song if the previous song has ended
      // if the audio player has entered the Idle state, it means that it has finished playing or has been stopped
      if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
        await this.play();
      }
    });
    voiceConnection.subscribe(this.audioPlayer);
  }

  // Add song to the queue
  public async addSongs(queueItems: QueueItem[]): Promise<void> {
    this.queue = this.queue.concat(queueItems);
    if (!this.playing) {
      await this.play();
    }
  }

  // Stop and clear the queue
  public stop(): void {
    this.playing = undefined;
    this.queue = [];
    this.audioPlayer.stop();
  }

  // function to make the bot leave the voice channel and delete the server from the map
  public leave(): void {
    if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
      this.voiceConnection.destroy();
    }
    this.stop();
    servers.delete(this.guildId);
  }

  // Pause the current song
  public pause(): void {
    this.audioPlayer.pause();
  }

  // Resume the current song
  public resume(): void {
    this.audioPlayer.unpause();
  }

  // jump to a specific position in the queue
  public async jump(position: number): Promise<QueueItem> {
    const target = this.queue[position - 1];
    this.queue = this.queue
      .splice(0, position - 1)
      .concat(this.queue.splice(position, this.queue.length - 1));
    this.queue.unshift(target);
    await this.play();
    return target;
  }

  // remove a song from the queue by its position
  public remove(position: number): QueueItem {
    return this.queue.splice(position - 1, 1)[0];
  }

  public async play(): Promise<void> {
    try {
      // if there are songs in the queue, we start playing the first one
      // stream the audio depending on the platform and then create an audio resource from the stream and play it
      if (this.queue.length > 0) {
        this.playing = this.queue.shift() as QueueItem;
        let stream: any;
        const highWaterMark = 1024 * 1024 * 10;
        //
        if (this.playing?.song.platform === Platform.YOUTUBE) {
          stream = ytdl(this.playing.song.url, {
            highWaterMark,
            filter: 'audioonly',
            quality: 'highestaudio',
          });
        } else {
          stream = await SoundCloud.download(this.playing.song.url, {
            highWaterMark,
          });
        }
        const audioResource = createAudioResource(stream);
        this.audioPlayer.play(audioResource);
      } else {
        // if there are no songs in the queue, we stop the player
        this.playing = undefined;
        this.audioPlayer.stop();
      }
    } catch (e) {
      // if there is an error streaming a song, skip to the next song
      this.play();
    }
  }
}

// Map to store the servers
export const servers = new Map<Snowflake, Server>();

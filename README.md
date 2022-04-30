# podcast-generator
A CLI tool that uses FFMPEG to generate videos from multiple audio files and an image.
FFMPEG is a library used by applications like Youtube, VLC media player and Blender to display and edit video and audio streams.

This project solves an extremely speciffic problem of mine.
I needed to upload a series of conferences in audio format to youtube. 
The issue is that youtube doesent allow users to upload audio files.
This application exists because any other application I tried took a verry long time to even simply concatenate a couple audio files.

Each conference was a playlist of audio files that had to be concatenated into one long audio file and converted into an uploadable video.
The application allows the use of an image to be displayed for the duration of the video.

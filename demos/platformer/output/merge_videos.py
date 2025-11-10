import os
import subprocess

def generate_file_list(directory, output_file):
    """Generate a file list for VLC concatenation."""
    with open(output_file, 'w') as f:
        for file in sorted(os.listdir(directory)):
            if file.endswith('.png'):
                f.write(f"file '{os.path.join(directory, file)}'\n")
    print(f"Generated file list: {output_file}")

def merge_images_to_video(directory, output_video):
    """Merge PNG images into a video using VLC."""
    command = [
        'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe', '--rate=15', '--sout', f"#transcode{{vcodec=h264,vb=800,scale=1}}:std{{access=file,mux=mp4,dst={output_video}}}", 'vlc://quit'
    ]
    for file in sorted(os.listdir(directory)):
        if file.endswith('.png'):
            command.insert(-1, os.path.join(directory, file))
    subprocess.run(command, check=True)

def main():
    directory = "C:\\new language\\out"
    output_video = os.path.join(directory, 'merged_output.mp4')

    print("Merging images into video...")
    merge_images_to_video(directory, output_video)
    print(f"Merged video saved as {output_video}")

if __name__ == '__main__':
    main()
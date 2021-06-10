const timeFromFile = file => {
  const parts = file.substring(0, file.indexOf('.')).split('-');

  const date = new Date();
  date.setHours(parts[0]);
  date.setMinutes(parts[1]);
  date.setSeconds(parts[2]);
  return date;
};

const secondsDiff = (file1, file2) => (timeFromFile(file2).getTime() - timeFromFile(file1).getTime()) / 1000;

export default function groupRecordings(files) {
  const images = [];
  let lastVideo = null;

  files.forEach(file => {
    if (file.endsWith('.jpg')) {
      if (lastVideo && images.length > 0 && secondsDiff(lastVideo, file) > 15) {
        images[images.length - 1].videos.push(lastVideo);
        lastVideo = null;
      }

      images.push({
        image: file,
        videos: []
      });

      if (lastVideo) {
        images[images.length - 1].videos.push(lastVideo);
        lastVideo = null;
      }
    } else {
      if (lastVideo && images.length > 0) {
        images[images.length - 1].videos.push(lastVideo);
        lastVideo = null;
      }
      
      if (images.length > 0 && secondsDiff(images[images.length - 1].image, file) < 15) {
        images[images.length - 1].videos.push(file);
      } else {
        lastVideo = file;
      }
    }
  });

  if (lastVideo && images.length > 0) {
    images[images.length - 1].videos.push(lastVideo);
  }

  return images;
}

const timeFromFile = file => {
  const parts = file.substring(0, file.indexOf('.')).split('-');

  const date = new Date();
  date.setHours(parts[0]);
  date.setMinutes(parts[1]);
  date.setSeconds(parts[2]);
  return date;
};

const secondsDiff = (file1, file2) => (timeFromFile(file2).getTime() - timeFromFile(file1).getTime()) / 1000;

const getPosition = file => {
  const time = timeFromFile(file);
  
  const date = new Date();
  date.setHours(0,0,0,0);
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (time.getTime() - date.getTime()) / (tomorrow.getTime() - date.getTime());
} 

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
        position: getPosition(file),
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

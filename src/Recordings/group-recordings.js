const timeFromFile = file => {
  const parts = file.substring(0, file.indexOf('.')).split('-');

  const date = new Date();
  let index = 0;
  if (parts.length >= 6) {
    date.setFullYear(parts[index++]);
    date.setMonth(parts[index++] - 1);
    date.setDate(parts[index++]);
  }
  date.setHours(parts[index++]);
  date.setMinutes(parts[index++]);
  date.setSeconds(parts[index++]);
  return date;
};

const secondsDiff = (file1, file2) => (timeFromFile(file2).getTime() - timeFromFile(file1).getTime()) / 1000;

const getPosition = (file, startDate, endDate) => {
  const time = timeFromFile(file);
  return (time.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime());
} 

export default function groupRecordings(files) {
  const images = [];
  let lastVideo = null;

  const startDate = timeFromFile(files[0]);
  startDate.setHours(0,0,0,0);
  const endDate = timeFromFile(files[files.length - 1]);
  endDate.setHours(0,0,0,0);
  endDate.setDate(endDate.getDate() + 1);

  files.forEach(file => {
    if (file.endsWith('.jpg')) {
      if (lastVideo && images.length > 0 && secondsDiff(lastVideo, file) > 15) {
        images[images.length - 1].videos.push(lastVideo);
        lastVideo = null;
      }

      images.push({
        image: file,
        position: getPosition(file, startDate, endDate),
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

let video = document.querySelector("video");
let recordBtn = document.querySelector("#record");
let capBtn = document.querySelector("#capture");
let mediaRecorder;
let chunks = [];
let isRecording = false;
let recDiv = recordBtn.querySelector("i");
let captureDiv = capBtn.querySelector("i");
let appliedFilter;
let minZoom = 1;
let maxZoom = 3;
let zoomInBtn = document.querySelector(".zoom-in");
let zoomOutBtn = document.querySelector(".zoom-out");
let currZoom = 1;  
let filters = document.querySelectorAll(".filter");
let galleryBtn = document.querySelector("#gallery");  
let filterContainer = document.querySelector(".filter-container");
let zoomContainer = document.querySelector(".zoom-container");
let blackScreen;

/*-------------------Move from camera to gallery---------------------*/
galleryBtn.addEventListener("click", function(){
  //localhost:5500/index.html -> localhost:5500/gallery.html
  location.assign("gallery.html");
});
 
/*-------------------Zoom In---------------------*/
zoomInBtn.addEventListener("click", function(){
    if(currZoom<maxZoom){
        currZoom = currZoom + 0.1;
    }
    video.style.transform = `scale(${currZoom})`;
});

/*-------------------Zoom Out---------------------*/
zoomOutBtn.addEventListener("click", function(){
    if(currZoom>minZoom){
        currZoom = currZoom - 0.1;
    }
    video.style.transform = `scale(${currZoom})`;
});

/*-------------------Filters---------------------*/
for (let i = 0; i < filters.length; i++) {
  filters[i].addEventListener("click", function (e) {
    removeFilter();
    appliedFilter  = e.currentTarget.style.backgroundColor;
    let div = document.createElement("div");
    div.style.backgroundColor = appliedFilter;
    div.classList.add("filter-div");
    body.append(div);
  });
}

recordBtn.addEventListener("click", function (e) {
  if (isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    filterContainer.style.display = "initial";
    zoomContainer.style.display = "flex";
    recDiv.classList.remove("record-animation");
  } else {
    mediaRecorder.start();
    appliedFilter = "";
    removeFilter();
    filterContainer.style.display = "none";
    zoomContainer.style.display = "none";
    currZoom = 1;
    video.style.transform = `scale(${currZoom})`;
    isRecording = true;
    recDiv.classList.add("record-animation");
  }
});

capBtn.addEventListener("click", function () {
  if (isRecording) return;
  //screen clicked to be saved
  captureDiv.classList.add("capture-animation");
  setTimeout(function() {
    captureDiv.classList.remove("capture-animation");
  }, 1000);

  let canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  let tool = canvas.getContext("2d");
  //origin shift
  console.log(currZoom);
  tool.translate(canvas.width/2, canvas.height/2);
  tool.scale(currZoom, currZoom);
  tool.translate(-canvas.width/2, -canvas.height/2);
  tool.drawImage(video, 0, 0);

  if(appliedFilter){
      tool.fillStyle = appliedFilter;
      tool.fillRect(0, 0, canvas.width, canvas.height);
  }

  let link = canvas.toDataURL();

  addMedia(link, "image");
});

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then(function (mediaStream) {
    // let options = { minType: "video/mp4" };
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.addEventListener("dataavailable", function (e) {
      //data which is getting recorded will be accessible here
      chunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", function (e) {
      let blob = new Blob(chunks, { type: "video/mp4" });
      chunks = [];

      addMedia(blob, "video");
    });

    video.srcObject = mediaStream; //setting source
  })
  .catch(function (err) {
    console.log(err);
  });

function removeFilter() {
  let filter = document.querySelector(".filter-div");
  if (filter) filter.remove();
}

let req = indexedDB.open("Camera", 1);
let db;
let body = document.querySelector("body");
let editPhotoId;
let cursor;

req.addEventListener("success", function () {
  db = req.result;
});

req.addEventListener("upgradeneeded", function () {
  let accessToNotesDb = req.result;
  accessToNotesDb.createObjectStore("Gallery", { keyPath: "mId" });
});

req.addEventListener("error", function () {
  console.log("error");
});

//script.js
function addMedia(media, type) {
  if (!db) return;
  let obj = { mId: Date.now(), media, type };

  let tx = db.transaction("Gallery", "readwrite");
  let gallery = tx.objectStore("Gallery");
  gallery.add(obj);
}

function deleteMedia(id) {
  if (!db) return;

  let tx = db.transaction("Gallery", "readwrite");
  let gallery = tx.objectStore("Gallery");

  //when we set id as an attribute to delete btn it becomes a string but we have stored id as a number in db so we have to typecast
  gallery.delete(Number(id));
}

// function editMedia(id){
//   if(!db) return;
//   let tx = db.transaction("Gallery", "readonly");
//   let gallery = tx.objectStore("Gallery");
//   let cReq = gallery.openCursor();

//   cReq.addEventListener("success", function () {
//     let cursor = cReq.result;
//     console.log(cursor);
//     if (cursor) {
//       let mediaObj = cursor.value;
//       if(mediaObj.mId == id){
//         imageLink = mediaObj.media;
//         console.log(imageLink);
//       }
//     }
//   });
// }

//gallery.html
function viewMedia() {
  let tx = db.transaction("Gallery", "readonly");
  let gallery = tx.objectStore("Gallery");
  let cReq = gallery.openCursor();

  cReq.addEventListener("success", function () {
    cursor = cReq.result;
    if (cursor) {
      let mediaObj = cursor.value;

      let div = document.createElement("div");
      div.classList.add("media-container");
      let linkForDownloadBtn = "";
      if (mediaObj.type == "video") {
        let url = window.URL.createObjectURL(mediaObj.media);
        linkForDownloadBtn = url;
        div.innerHTML = `<div class="media">
        <video src="${url}" autoplay loop controls muted></vide>
    </div>
    <button class="download">Downdload</button>
    <button class="delete" data-id="${mediaObj.mId}" >Delete</button>`; //data- is predefined
      } else {
        linkForDownloadBtn = mediaObj.media;
        div.innerHTML = `<div class="media">
        <img src="${mediaObj.media}" />
    </div>
    <button class="download">Download</button>
    <button class="delete" data-id="${mediaObj.mId}" >Delete</button>`;
      }

      let downloadBtn = div.querySelector(".download");
      downloadBtn.addEventListener("click", function () {
        let a = document.createElement("a");
        a.href = linkForDownloadBtn;

        if ((mediaObj.type = "video")) {
          a.download = "video.mp4";
        } else {
          a.download = "img.png";
        }
        a.click();
        a.remove();
      });

      let deleteBtn = div.querySelector(".delete");
      deleteBtn.addEventListener("click", function (e) {
        //removing from db
        let id = e.currentTarget.getAttribute("data-id");
        deleteMedia(id);

        //removing from ui
        e.currentTarget.parentElement.remove();
      });

      body.append(div);
      cursor.continue();
    }
  });
}

let currentSong = new Audio();
let songs;
let currFolder;



async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`https://api.github.com/repos/ajeetkr77/MuzeBox/contents/${folder}`)
    let response = await a.json()
    //console.log(response)

    songs = []

    for (let index = 0; index < response.length; index++) {
        const element = response[index];
        if (element.name.endsWith(".mp3")) {
            songs.push(element.download_url.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songLists").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
           <div class="libPlayList">
               <div><img class="invert" src="img/music.svg" alt=""></div>  
               <div class="info">
                   ${song.replaceAll("%20", " ")}  
               </div> 
               <div><img class="invert" src="img/play.svg" alt=""></div>
           </div> 
       </li>`
    }

    Array.from(document.querySelector(".songLists").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").innerHTML.trim())
        })
    })

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `https://raw.githubusercontent.com/ajeetkr77/MuzeBox/main/${currFolder}/${track}`
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    } else {
        play.src = "img/play.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

function formatTime(input) {
    const totalSeconds = Math.floor(Number(input));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');
    return `${formattedMins}:${formattedSecs}`;
}

async function displayAlbums() {
    let a = await fetch(`https://api.github.com/repos/ajeetkr77/MuzeBox/contents/songs/`)
    let response = await a.json()
    //console.log(response)

    let cardContainer = document.querySelector(".cardContainer")
    for (let index = 0; index < response.length; index++) {
        const e = response[index]
        if (e.type === "dir") {
            let folder = e.name
            let a = await fetch(`https://raw.githubusercontent.com/ajeetkr77/MuzeBox/main/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
                        <circle cx="12" cy="12" r="10" fill="green" />
                        <path d="M15.9453 12.3948C15.7686 13.0215 14.9333 13.4644 13.2629 14.3502C11.648 15.2064 10.8406 15.6346 10.1899 15.4625C9.9209 15.3913 9.6758 15.2562 9.47812 15.0701C9 14.6198 9 13.7465 9 12C9 10.2535 9 9.38018 9.47812 8.92995C9.6758 8.74381 9.9209 8.60868 10.1899 8.53753C10.8406 8.36544 11.648 8.79357 13.2629 9.64983C14.9333 10.5356 15.7686 10.9785 15.9453 11.6052C16.0182 11.8639 16.0182 12.1361 15.9453 12.3948Z" fill="black" /> 
                    </svg>
                </div>
                <img src="https://raw.githubusercontent.com/ajeetkr77/MuzeBox/main/songs/${folder}/cover.jpg" alt="">
                <h4>${response.title}</h4>
                <p>${response.description}</p>
            </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async element => {
            songs = await getSongs(`songs/${element.currentTarget.dataset.folder}`)
            playMusic(songs[0], true)
        })
    })
}

function updateSongProgress() {
    if (!isNaN(currentSong.duration)) {
        const currentTime = currentSong.currentTime
        const duration = currentSong.duration
        document.querySelector(".songTime").innerHTML = `${formatTime(currentTime)} / ${formatTime(duration)}`
        const progress = (currentTime / duration) * 100
        document.querySelector(".circle").style.left = `${progress}%`
    }
}

async function main() {
    songs = await getSongs("songs/Ajeet")
    playMusic(songs[0], true)
    displayAlbums()

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })

    currentSong.addEventListener("loadedmetadata", updateSongProgress)
    currentSong.addEventListener("timeupdate", updateSongProgress)

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = 0;
    })

    document.querySelector(".closeSign").addEventListener("click", e => {
        document.querySelector(".left").style.left = -120 + "%";
    })

    previous.addEventListener("click", e => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index - 1 >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", e => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e => {
        currentSong.volume = e.target.value;
    })

    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0.0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = 0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0.1;
        }
    })
}

main()

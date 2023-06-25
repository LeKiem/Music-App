const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PlAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    //config: {},
    // (1/2) Uncomment the line below to use localStorage
    config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},


    songs: [{
            name: "Click Pow Get Down",
            singer: "Raftaar x Fortnite",
            path: "./music/1.mp3",
            image: "./img/1.jpg",
        },
        {
            name: "Tu Phir Se Aana",
            singer: "Raftaar x Salim Merchant x Karma",
            path: "./music/2.mp3",
            image: "./img/2.jpg"
        },
        {
            name: "Naachne Ka Shaunq",
            singer: "Raftaar x Brobha V",
            path: "./music/3.mp3",
            image: "./img/3.jpg"
        },
        {
            name: "Mantoiyat",
            singer: "Raftaar x Nawazuddin Siddiqui",
            path: "./music/4.mp3",
            image: "./img/4.jpg"
        },
        {
            name: "Aage Chal",
            singer: "Raftaar",
            path: "./music/5.mp3",
            image: "./img/5.jpg"
        },
        {
            name: "Damn",
            singer: "Raftaar x kr$na",
            path: "./music/6.mp3",
            image: "./img/6.jpg"
        },
        {
            name: "Feeling You",
            singer: "Raftaar x Harjas",
            path: "./music/6.mp3",
            image: "./img/7.jpg"
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                        <div class="song ${
                          index === this.currentIndex ? "active" : ""
                        }" data-index="${index}">
                            <div class="thumb"
                                style="background-image: url('${song.image}')">
                            </div>
                            <div class="body">
                                <h3 class="title">${song.name}</h3>
                                <p class="author">${song.singer}</p>
                            </div>
                            <div class="option">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </div>
                    `;
        })

        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function() {
        Object.defineProperty(this, "currentSong", {
            get: function() {
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvent: function() {
        const _this = this;

        const cdWidth = cd.offsetWidth;

        //xử lý CD quay và dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }

        ], {
            duration: 10000,
            iterations: Infinity

        })
        cdThumbAnimate.pause()
            // Xử lý phóng to hc thu nhỏ CD
        document.onscroll = function() {
                const srcollTop = document.srcollY || document.documentElement.scrollTop;
                const newCdWidth = cdWidth - srcollTop;
                cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
                cd.style.opacity = newCdWidth / cdWidth
            }
            //xử lý khi click play
        playBtn.onclick = function() {

            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }

        }

        //Khi bài hát được play 
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        //Khi bài hát bị dừng
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing')
            cdThumbAnimate.pause()

        }

        // Khi tiến độ bài hát thay đổi
        // When the song progress changes
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent;
            }
        };

        // Xử lý khi tua song
        // Handling when seek
        progress.oninput = function(e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
        };

        //khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // khi prev song
        prevBtn.onclick = function() {
                if (_this.isRandom) {
                    _this.playRandomSong();
                } else {
                    _this.prevSong();
                }
                audio.play();
                _this.render();
                _this.scrollToActiveSong();
            }
            // khi random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        }

        //Xử lý lặp lại một song
        repeatBtn.onclick = function() {
                _this.isRepeat = !_this.isRepeat;
                _this.setConfig('isRepeat', _this.isRepeat);
                repeatBtn.classList.toggle("active", _this.isRepeat);
            },

            // XỬ lý nẽt song khi audio ended
            audio.onended = function() {
                if (_this.isRepeat) {
                    audio.play();
                } else {
                    nextBtn.onclick()
                }

            }
            //Lắng nghe hành vi click  vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (
                songNode || e.target.closest('.option')) {

                //Xử lý khi click vào song 
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();

                }
                //Xử lý khi click vào option
                if (e.target.closest('.option')) {

                }

            }
        }


    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: "end",
                inline: "nearest"
            })
        }, 500)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }

        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }

        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },


    start: function() {
        //Gán cấu hình từ config 
        this.loadConfig();
        //Định nghĩa các thuộc tính cho object
        this.defineProperties();

        //lắng nghe / xử lí các sự kiện (DOM events)
        this.handleEvent()

        // tải thông tin bài hát đầu tiên vào ui 
        this.loadCurrentSong()

        // Render 
        this.render()

        //Hiện thị trạng thái ban đầu của btn repeat & random
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);

    }


}

app.start()
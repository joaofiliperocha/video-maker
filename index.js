
const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text.js'),
    state: require('./robots/state.js'),
    images: require('./robots/images.js'),
    video: require('./robots/video.js'),
    youtube: require('./robots/youtube.js')
}

async function start() {

    robots.input();
    await robots.text();
    await robots.images();
    await robots.video();
    await robots.youtube()


}

start();
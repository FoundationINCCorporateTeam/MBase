async function processVideo() {
    const videoInput = document.getElementById('videoInput');
    const resultDiv = document.getElementById('result');
    const videoElement = document.getElementById('video');
    
    if (videoInput.files.length === 0) {
        alert('Please select a video file.');
        return;
    }

    const file = videoInput.files[0];
    const url = URL.createObjectURL(file);
    videoElement.src = url;

    resultDiv.innerText = 'Processing video...';

    // Load the Hugging Face model (assuming an image classification model is available)
    const pipeline = await window.transformers.pipeline("image-classification", "google/vit-base-patch16-224");

    // Extract frames from the video
    const frames = await extractFrames(videoElement);

    // Analyze each frame with the model
    for (const frame of frames) {
        const output = await pipeline(frame);
        console.log(output);  // Output for debugging purposes
        // Process the output as needed (example below)
        if (output.some(result => result.label === 'runner_out')) {
            resultDiv.innerText = 'The runner is out';
            return;
        }
    }

    resultDiv.innerText = 'The runner is safe';
}

// Function to extract frames from the video
function extractFrames(videoElement) {
    return new Promise((resolve) => {
        const frames = [];
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const interval = 1000;  // Extract a frame every second
        videoElement.addEventListener('loadeddata', () => {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            let currentTime = 0;
            const duration = videoElement.duration;

            function captureFrame() {
                videoElement.currentTime = currentTime;
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                frames.push(canvas.toDataURL('image/png'));
                currentTime += interval / 1000;
                if (currentTime <= duration) {
                    setTimeout(captureFrame, interval);
                } else {
                    resolve(frames);
                }
            }

            captureFrame();
        });
    });
}

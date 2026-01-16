class ImageGenerator {
    constructor() {
        this.isGenerating = false;
        this.initializeEventListeners();
        this.updateSliderValues();
    }

    initializeEventListeners() {
        // Slider events
        document.getElementById('steps').addEventListener('input', () => this.updateSliderValues());
        document.getElementById('width').addEventListener('input', () => this.updateSliderValues());
        document.getElementById('height').addEventListener('input', () => this.updateSliderValues());

        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => this.generateImage());

        // Preset prompts
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('prompt').value = btn.dataset.prompt;
            });
        });

        // Enter key support
        document.getElementById('prompt').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateImage();
            }
        });
    }

    updateSliderValues() {
        document.getElementById('steps-value').textContent = document.getElementById('steps').value;
        document.getElementById('width-value').textContent = document.getElementById('width').value;
        document.getElementById('height-value').textContent = document.getElementById('height').value;
    }

    async generateImage() {
        if (this.isGenerating) return;

        const prompt = document.getElementById('prompt').value.trim();
        if (!prompt) {
            this.showNotification('Please enter a prompt', true);
            return;
        }

        this.isGenerating = true;
        this.updateUIForGeneration(true);

        const params = {
            prompt: prompt,
            steps: parseInt(document.getElementById('steps').value),
            width: parseInt(document.getElementById('width').value),
            height: parseInt(document.getElementById('height').value)
        };

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });

            const data = await response.json();

            if (data.success) {
                this.displayProgressiveImages(data.images, prompt);
            } else {
                throw new Error(data.error);
            }
            
        } catch (error) {
            console.error('Generation error:', error);
            this.showNotification('Generation failed: ' + error.message, true);
            this.updateUIForGeneration(false);
        }
    }

    displayProgressiveImages(images, prompt) {
        const imageElement = document.getElementById('generated-image');
        const placeholder = document.getElementById('image-placeholder');
        const progressBar = document.getElementById('progress-bar');
        const stepCounter = document.getElementById('step-counter');
        const promptDisplay = document.getElementById('prompt-display');

        promptDisplay.textContent = `"${prompt}"`;
        placeholder.style.display = 'none';
        imageElement.style.display = 'block';

        let currentIndex = 0;

        const displayNextImage = () => {
            if (currentIndex < images.length) {
                imageElement.src = images[currentIndex];
                
                const progress = ((currentIndex + 1) / images.length) * 100;
                progressBar.style.width = `${progress}%`;
                
                stepCounter.textContent = `Step ${currentIndex + 1}/${images.length}`;
                
                currentIndex++;
                setTimeout(displayNextImage, 300);
            } else {
                this.isGenerating = false;
                this.updateUIForGeneration(false);
                this.showNotification('Image generated successfully!');
            }
        };

        displayNextImage();
    }

    updateUIForGeneration(generating) {
        const button = document.getElementById('generate-btn');
        const spinner = button.querySelector('.spinner');
        const buttonText = button.querySelector('span');

        if (generating) {
            button.disabled = true;
            buttonText.textContent = 'Generating...';
            spinner.style.display = 'block';
            document.getElementById('status-text').textContent = 'Generating image...';
        } else {
            button.disabled = false;
            buttonText.textContent = 'Generate Image';
            spinner.style.display = 'none';
            document.getElementById('status-text').textContent = 'Ready to generate';
        }
    }

    showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${isError ? 'error' : ''} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ImageGenerator();
});
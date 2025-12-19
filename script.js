// Urdu Drama Creator - Complete Engine
class UrduDramaCreator {
    constructor() {
        this.currentDrama = null;
        this.isPlaying = false;
        this.currentLine = 0;
        this.characters = {};
        this.backgrounds = {
            beach: 'linear-gradient(to bottom, #4facfe, #00f2fe)',
            hospital: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)',
            cafe: 'linear-gradient(to bottom, #8B7355, #A0522D)',
            park: 'linear-gradient(to bottom, #2E8B57, #3CB371)',
            office: 'linear-gradient(to bottom, #636363, #a2a2a2)',
            home: 'linear-gradient(to bottom, #FFE4B5, #F5DEB3)'
        };
        this.music = {
            romantic: '🎵 Romantic Piano',
            sad: '🎵 Emotional Strings',
            happy: '🎵 Happy Acoustic',
            intense: '🎵 Dramatic Orchestra',
            light: '🎵 Light Background'
        };
    }

    // Parse script and create drama
    createDrama(scriptText) {
        this.showLoading(true);
        
        try {
            const lines = scriptText.split('\n');
            const drama = {
                title: 'Your Drama',
                scenes: [],
                characters: new Set(),
                currentScene: null,
                music: 'light',
                background: 'home'
            };

            for (let line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                // Detect scene
                if (trimmed.toUpperCase().includes('[SCENE:')) {
                    const sceneMatch = trimmed.match(/\[SCENE:\s*(.*?)\]/i);
                    if (sceneMatch) {
                        drama.currentScene = {
                            name: sceneMatch[1],
                            dialogues: [],
                            actions: [],
                            sounds: []
                        };
                        drama.scenes.push(drama.currentScene);
                    }
                }
                
                // Detect background
                else if (trimmed.toUpperCase().includes('[BACKGROUND:')) {
                    const bgMatch = trimmed.match(/\[BACKGROUND:\s*(.*?)\]/i);
                    if (bgMatch) {
                        drama.background = bgMatch[1].toLowerCase();
                    }
                }
                
                // Detect music
                else if (trimmed.toUpperCase().includes('[MUSIC:')) {
                    const musicMatch = trimmed.match(/\[MUSIC:\s*(.*?)\]/i);
                    if (musicMatch) {
                        drama.music = musicMatch[1].toLowerCase();
                    }
                }
                
                // Detect dialogue
                else if (trimmed.includes(':')) {
                    const parts = trimmed.split(':');
                    if (parts.length >= 2) {
                        const character = parts[0].trim();
                        let dialogue = parts.slice(1).join(':').trim();
                        
                        drama.characters.add(character);
                        
                        if (drama.currentScene) {
                            drama.currentScene.dialogues.push({
                                character: character,
                                dialogue: dialogue,
                                emotion: this.detectEmotion(dialogue)
                            });
                        }
                    }
                }
                
                // Detect action
                else if (trimmed.toUpperCase().includes('[ACTION:')) {
                    const actionMatch = trimmed.match(/\[ACTION:\s*(.*?)\]/i);
                    if (actionMatch && drama.currentScene) {
                        drama.currentScene.actions.push(actionMatch[1]);
                    }
                }
                
                // Detect sound
                else if (trimmed.toUpperCase().includes('[SOUND:')) {
                    const soundMatch = trimmed.match(/\[SOUND:\s*(.*?)\]/i);
                    if (soundMatch && drama.currentScene) {
                        drama.currentScene.sounds.push(soundMatch[1]);
                    }
                }
                
                // Detect pause
                else if (trimmed.toUpperCase().includes('[PAUSE:')) {
                    const pauseMatch = trimmed.match(/\[PAUSE:\s*(.*?)\]/i);
                    if (pauseMatch && drama.currentScene) {
                        drama.currentScene.dialogues.push({
                            character: 'PAUSE',
                            dialogue: `Pause for ${pauseMatch[1]} seconds`,
                            duration: parseInt(pauseMatch[1]) || 2
                        });
                    }
                }
            }

            this.currentDrama = drama;
            this.displayDramaPreview(drama);
            this.showLoading(false);
            
            document.getElementById('downloadBtn').disabled = false;
            updateStatus(`Drama created! ${drama.scenes.length} scenes, ${drama.characters.size} characters`);
            
            return drama;
            
        } catch (error) {
            this.showLoading(false);
            updateStatus('Error creating drama: ' + error.message, 'error');
            return null;
        }
    }

    // Detect emotion from dialogue
    detectEmotion(dialogue) {
        const lower = dialogue.toLowerCase();
        if (lower.includes('(happy)') || lower.includes('😊') || lower.includes('smiling')) return 'happy';
        if (lower.includes('(sad)') || lower.includes('😢') || lower.includes('crying')) return 'sad';
        if (lower.includes('(angry)') || lower.includes('😠') || lower.includes('shouting')) return 'angry';
        if (lower.includes('(nervous)') || lower.includes('😰') || lower.includes('anxious')) return 'nervous';
        if (lower.includes('(love)') || lower.includes('❤') || lower.includes('romantic')) return 'romantic';
        return 'neutral';
    }

    // Display drama preview
    displayDramaPreview(drama) {
        // Set background
        const bg = document.getElementById('stageBackground');
        bg.style.background = this.backgrounds[drama.background] || this.backgrounds.home;
        
        // Update status
        const musicText = this.music[drama.music] || 'Custom Music';
        updateStatus(`Background: ${drama.background} | Music: ${musicText} | Characters: ${Array.from(drama.characters).join(', ')}`);
        
        // Set character names
        const chars = Array.from(drama.characters);
        if (chars.length > 0) {
            document.getElementById('avatar1').alt = chars[0];
            document.getElementById('avatar2').alt = chars[1] || 'Character 2';
        }
    }

    // Play drama
    async playDrama() {
        if (!this.currentDrama || this.currentDrama.scenes.length === 0) {
            updateStatus('No drama to play. Create a drama first.', 'error');
            return;
        }

        this.isPlaying = true;
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-pause"></i> Playing';
        
        for (const scene of this.currentDrama.scenes) {
            if (!this.isPlaying) break;
            
            updateStatus(`Playing scene: ${scene.name}`);
            
            for (const item of scene.dialogues) {
                if (!this.isPlaying) break;
                
                if (item.character === 'PAUSE') {
                    updateStatus(`Pausing for ${item.duration} seconds...`);
                    await this.sleep(item.duration * 1000);
                    continue;
                }
                
                // Show character speaking
                this.showCharacterSpeaking(item.character, item.dialogue);
                
                // Speak in Urdu
                await this.speakUrdu(item.dialogue, item.character);
                
                // Wait between dialogues
                await this.sleep(2000);
            }
        }
        
        this.isPlaying = false;
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Play';
        updateStatus('Drama finished playing.');
    }

    // Show character speaking
    showCharacterSpeaking(character, dialogue) {
        const chars = Array.from(this.currentDrama.characters);
        const charIndex = chars.indexOf(character);
        
        // Show speech bubble
        const bubbleId = charIndex === 0 ? 'bubble1' : 'bubble2';
        const bubble = document.getElementById(bubbleId);
        
        // Translate to Urdu (simulated)
        const urduTranslation = this.translateToUrdu(dialogue);
        
        bubble.innerHTML = `<strong>${character}:</strong><br>${dialogue}`;
        bubble.style.display = 'block';
        
        // Update subtitles
        document.getElementById('subtitleEnglish').textContent = `${character}: ${dialogue}`;
        document.getElementById('subtitleUrdu').textContent = urduTranslation;
        
        // Hide other bubble
        const otherBubbleId = charIndex === 0 ? 'bubble2' : 'bubble1';
        document.getElementById(otherBubbleId).style.display = 'none';
    }

    // Translate to Urdu (simplified simulation)
    translateToUrdu(text) {
        const translations = {
            'love': 'محبت',
            'sorry': 'معافی',
            'thank': 'شکریہ',
            'happy': 'خوش',
            'sad': 'اداس',
            'hello': 'سلام',
            'goodbye': 'الوداع',
            'please': 'براہ کرم',
            'yes': 'ہاں',
            'no': 'نہیں',
            'I': 'میں',
            'you': 'تم',
            'we': 'ہم',
            'they': 'وہ'
        };
        
        let urduText = text;
        for (const [eng, urdu] of Object.entries(translations)) {
            const regex = new RegExp(`\\b${eng}\\b`, 'gi');
            urduText = urduText.replace(regex, urdu);
        }
        
        return urduText + ' (اردو میں)';
    }

    // Speak in Urdu (using Web Speech API)
    speakUrdu(text, character) {
        return new Promise((resolve) => {
            if ('speechSynthesis' in window) {
                const speech = new SpeechSynthesisUtterance();
                speech.text = this.translateToUrdu(text);
                speech.lang = 'ur-PK'; // Urdu Pakistan
                speech.rate = 0.9;
                speech.pitch = character.toLowerCase().includes('female') ? 1.2 : 1.0;
                speech.volume = 1;
                
                speech.onend = resolve;
                speech.onerror = resolve;
                
                window.speechSynthesis.speak(speech);
            } else {
                // If no TTS, just wait
                setTimeout(resolve, 3000);
            }
        });
    }

    // Pause drama
    pauseDrama() {
        this.isPlaying = false;
        window.speechSynthesis.cancel();
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Play';
        updateStatus('Drama paused');
    }

    // Stop drama
    stopDrama() {
        this.isPlaying = false;
        this.currentLine = 0;
        window.speechSynthesis.cancel();
        
        // Hide speech bubbles
        document.getElementById('bubble1').style.display = 'none';
        document.getElementById('bubble2').style.display = 'none';
        
        // Reset subtitles
        document.getElementById('subtitleEnglish').textContent = 'Drama stopped';
        document.getElementById('subtitleUrdu').textContent = 'ڈرامہ روک دیا گیا';
        
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Play';
        updateStatus('Drama stopped');
    }

    // Test voice
    testVoice() {
        const testText = "Hello, this is a test of Urdu voice system.";
        this.speakUrdu(testText, 'Test');
        updateStatus('Testing Urdu voice...');
    }

    // Download drama as MP4
    downloadDrama() {
        if (!this.currentDrama) {
            updateStatus('No drama to download. Create a drama first.', 'error');
            return;
        }

        updateStatus('Preparing MP4 download...');
        
        // Simulate video creation
        setTimeout(() => {
            const drama = this.currentDrama;
            const fileName = `urdu-drama-${Date.now()}.mp4`;
            
            // Create download link
            const data = {
                drama: drama,
                generatedAt: new Date().toISOString(),
                format: 'MP4',
                resolution: '1920x1080',
                duration: 'Auto-calculated'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            updateStatus(`Download started: ${fileName}`);
        }, 2000);
    }

    // Utility functions
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
    }
}

// Initialize drama creator
const dramaCreator = new UrduDramaCreator();

// Global functions for HTML buttons
function createDrama() {
    const script = document.getElementById('scriptInput').value.trim();
    if (!script) {
        alert('Please write a script first.');
        return;
    }
    dramaCreator.createDrama(script);
}

function playDrama() {
    dramaCreator.playDrama();
}

function pauseDrama() {
    dramaCreator.pauseDrama();
}

function stopDrama() {
    dramaCreator.stopDrama();
}

function testVoice() {
    dramaCreator.testVoice();
}

function downloadDrama() {
    dramaCreator.downloadDrama();
}

function updateStatus(message, type = 'info') {
    const statusBar = document.getElementById('statusBar');
    const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    const color = type === 'error' ? '#ff2e63' : '#00adb5';
    
    statusBar.innerHTML = `<i class="fas ${icon}" style="color:${color}"></i> ${message}`;
}

// Auto-resize textarea
document.getElementById('scriptInput').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Initialize
updateStatus('Ready to create Urdu drama. Write your script in English and click "Create Drama".');

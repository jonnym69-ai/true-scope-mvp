document.getElementById('generate').addEventListener('click', function() {
    const generateBtn = document.getElementById('generate');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Thinking...';
    document.getElementById('loading').style.display = 'block';
    setTimeout(() => {
        const idea = document.getElementById('idea').value.toLowerCase();
        const tool = document.getElementById('tool').value;
        let planType = 'generic';

        if (idea.includes('platformer')) {
            planType = 'platformer';
        } else if (idea.includes('rpg')) {
            planType = 'rpg';
        } else if (idea.includes('shooter') || idea.includes('fps')) {
            planType = 'shooter';
        } else if (idea.includes('farm') || idea.includes('farming') || idea.includes('harvest') || idea.includes('crops') || idea.includes('stardew') || idea.includes('ranch') || idea.includes('animals')) {
            planType = 'farming';
        } else if (idea.includes('puzzle') || idea.includes('logic') || idea.includes('match') || idea.includes('brain') || idea.includes('tile') || idea.includes('grid') || idea.includes('sokoban') || idea.includes('tetris')) {
            planType = 'puzzle';
        }

        const plan = generatePlan(planType, tool);
        document.getElementById('output').innerHTML = plan;
        document.getElementById('loading').style.display = 'none';
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Plan';
    }, 600);
});

document.getElementById('copy').addEventListener('click', function() {
    const output = document.getElementById('output');
    const text = output.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const conf = document.getElementById('confirmation');
        conf.innerHTML = '✅ Plan copied! <strong>Next steps:</strong> Save it somewhere, share it, or start building your game! 🎮';
        setTimeout(() => conf.innerText = '', 5000);
    });
});

document.getElementById('reset').addEventListener('click', function() {
    const output = document.getElementById('output');
    output.classList.add('fade-out');
    setTimeout(() => {
        document.getElementById('idea').value = '';
        document.getElementById('tool').value = 'Unity';
        output.innerHTML = '';
        document.getElementById('confirmation').innerText = '';
        output.classList.remove('fade-out');
    }, 500);
});

function generatePlan(type, tool) {
    let scope = '';
    let roadmap = '';
    let folders = '';
    let start = `Start here: Create a new project in ${tool}.`;

    if (type === 'platformer') {
        scope = `
            <h2>Tiny Scope</h2>
            <ul>
                <li>Basic player character that can walk and jump</li>
                <li>Simple platform level with obstacles</li>
                <li>One enemy type with basic AI</li>
                <li>Collectible item for scoring</li>
                <li>Goal to reach the end of the level</li>
            </ul>
        `;
        roadmap = `
            <h2>1-Week Roadmap</h2>
            <ul>
                <li><strong>Day 1:</strong> Set up project and basic scene</li>
                <li><strong>Day 2:</strong> Implement player movement (walk, jump)</li>
                <li><strong>Day 3:</strong> Add platforms and level design</li>
                <li><strong>Day 4:</strong> Add enemy AI</li>
                <li><strong>Day 5:</strong> Add collectibles and scoring</li>
                <li><strong>Day 6:</strong> Polish controls and UI</li>
                <li><strong>Day 7:</strong> Testing, bug fixes, and build</li>
            </ul>
        `;
        folders = `
            <h2>Recommended Folder Structure</h2>
            <pre>Assets/Sprites/
Assets/Scripts/
Assets/Scenes/
Assets/Prefabs/</pre>
        `;
    } else if (type === 'rpg') {
        scope = `
            <h2>Tiny Scope</h2>
            <ul>
                <li>Player character with basic stats</li>
                <li>Simple quest system</li>
                <li>NPC for dialogue and quest</li>
                <li>Basic inventory system</li>
                <li>Small explorable world</li>
            </ul>
        `;
        roadmap = `
            <h2>1-Week Roadmap</h2>
            <ul>
                <li><strong>Day 1:</strong> Set up project and UI basics</li>
                <li><strong>Day 2:</strong> Implement player movement and stats</li>
                <li><strong>Day 3:</strong> Add NPC and dialogue system</li>
                <li><strong>Day 4:</strong> Implement quest mechanics</li>
                <li><strong>Day 5:</strong> Add inventory</li>
                <li><strong>Day 6:</strong> Create world and exploration</li>
                <li><strong>Day 7:</strong> Polish and testing</li>
            </ul>
        `;
        folders = `
            <h2>Recommended Folder Structure</h2>
            <pre>Assets/Scripts/
Assets/UI/
Assets/Scenes/
Assets/Items/</pre>
        `;
    } else if (type === 'shooter') {
        scope = `
            <h2>Tiny Scope</h2>
            <ul>
                <li>Player movement in an arena</li>
                <li>Basic shooting mechanic with projectiles</li>
                <li>One enemy type that moves and attacks</li>
                <li>Simple arena with boundaries</li>
                <li>Win condition: defeat all enemies</li>
            </ul>
        `;
        roadmap = `
            <h2>1-Week Roadmap</h2>
            <ul>
                <li><strong>Day 1:</strong> Set up project and basic scene</li>
                <li><strong>Day 2:</strong> Implement player movement</li>
                <li><strong>Day 3:</strong> Add shooting mechanics</li>
                <li><strong>Day 4:</strong> Create enemy AI</li>
                <li><strong>Day 5:</strong> Design arena and boundaries</li>
                <li><strong>Day 6:</strong> Add scoring and UI</li>
                <li><strong>Day 7:</strong> Polish and testing</li>
            </ul>
        `;
        folders = `
            <h2>Recommended Folder Structure</h2>
            <pre>Assets/Sprites/
Assets/Scripts/
Assets/Scenes/
Assets/Prefabs/</pre>
        `;
    } else if (type === 'farming') {
        scope = `
            <h2>Tiny Scope</h2>
            <ul>
                <li>One crop type (e.g., carrots)</li>
                <li>One plot of land (3x3 grid)</li>
                <li>Simple planting and harvesting loop</li>
                <li>One day/night cycle</li>
                <li>One NPC or shop interaction</li>
            </ul>
        `;
        roadmap = `
            <h2>1-Week Roadmap</h2>
            <ul>
                <li><strong>Day 1:</strong> Project setup + player movement</li>
                <li><strong>Day 2:</strong> Implement tile grid for farming plot</li>
                <li><strong>Day 3:</strong> Add planting + growth timer</li>
                <li><strong>Day 4:</strong> Add harvesting + inventory</li>
                <li><strong>Day 5:</strong> Add simple day/night cycle</li>
                <li><strong>Day 6:</strong> Add NPC or shop interaction</li>
                <li><strong>Day 7:</strong> Polish + export build</li>
            </ul>
        `;
        folders = `
            <h2>Recommended Folder Structure</h2>
            <pre>Assets/Scripts/
Assets/Scenes/
Assets/Sprites/
Assets/Prefabs/
Assets/UI/</pre>
        `;
        start = "Start by creating a 3x3 grid of tiles and make each tile clickable.";
    } else if (type === 'puzzle') {
        scope = `
            <h2>Tiny Scope</h2>
            <ul>
                <li>One core mechanic (e.g., pushing blocks, matching tiles, rotating shapes)</li>
                <li>One puzzle board or grid</li>
                <li>Three handcrafted levels</li>
                <li>Simple win condition (clear board, reach goal, solve layout)</li>
                <li>Basic UI (restart button + level select)</li>
            </ul>
        `;
        roadmap = `
            <h2>1-Week Roadmap</h2>
            <ul>
                <li><strong>Day 1:</strong> Project setup + core mechanic prototype</li>
                <li><strong>Day 2:</strong> Build the puzzle grid or board system</li>
                <li><strong>Day 3:</strong> Implement interactions (push, rotate, match, swap)</li>
                <li><strong>Day 4:</strong> Add win condition + level reset</li>
                <li><strong>Day 5:</strong> Create 3 simple levels</li>
                <li><strong>Day 6:</strong> Add UI (restart, next level)</li>
                <li><strong>Day 7:</strong> Polish + export build</li>
            </ul>
        `;
        folders = `
            <h2>Recommended Folder Structure</h2>
            <pre>Assets/Scripts/
Assets/Scenes/
Assets/Sprites/
Assets/Levels/
Assets/UI/</pre>
        `;
        start = "Start by creating a small grid (e.g., 4x4) and make one tile interactive.";
    } else {
        scope = `
            <h2>Tiny Scope</h2>
            <ul>
                <li>Core gameplay mechanic</li>
                <li>Simple level or scene</li>
                <li>Basic interaction or challenge</li>
                <li>Win/lose condition</li>
            </ul>
        `;
        roadmap = `
            <h2>1-Week Roadmap</h2>
            <ul>
                <li><strong>Day 1:</strong> Set up project and basic setup</li>
                <li><strong>Day 2:</strong> Implement core mechanic</li>
                <li><strong>Day 3:</strong> Add level elements</li>
                <li><strong>Day 4:</strong> Add interactions</li>
                <li><strong>Day 5:</strong> Implement win/lose</li>
                <li><strong>Day 6:</strong> Add UI and polish</li>
                <li><strong>Day 7:</strong> Test and refine</li>
            </ul>
        `;
        folders = `
            <h2>Recommended Folder Structure</h2>
            <pre>Assets/Scripts/
Assets/Assets/
Assets/Scenes/</pre>
        `;
    }

    let advice = getToolAdvice(tool, type);

    return `<h2>Your Game Plan</h2><br><br>${scope}<br><br>${roadmap}<br><br>${folders}<br><br><h2>Tool-Specific Advice</h2><p>${advice}</p><br><br><p><strong>Start Here:</strong> ${start}</p>`;
}

function getToolAdvice(tool, type) {
    switch (tool) {
        case 'Unity': {
            if (type === 'platformer') {
                return 'Use Unity\'s 2D tools: Rigidbody2D for physics-based movement, Tilemap for level design. Check Unity Learn for 2D platformer tutorials.';
            } else if (type === 'rpg') {
                return 'Use Unity\'s UI system for inventory and menus, ScriptableObjects for item data. Explore Unity\'s tutorial on RPG basics.';
            } else if (type === 'shooter') {
                return 'Use Unity\'s Instantiate for spawning projectiles, Physics for collisions. Refer to Unity\'s shooter tutorials.';
            } else if (type === 'farming') {
                return 'Use Tilemaps for the farm grid, Coroutines for crop growth.';
            } else if (type === 'puzzle') {
                return 'Use a GridLayoutGroup or manually position tiles; use ScriptableObjects for level data.';
            } else {
                return 'Leverage Unity\'s components and scripting for your game logic. Start with Unity\'s beginner tutorials.';
            }
        }
        break;
        case 'Godot': {
            if (type === 'platformer') {
                return 'Use Godot\'s 2D nodes: KinematicBody2D for player movement, TileMap for levels. Refer to Godot\'s official docs for platformer examples.';
            } else if (type === 'rpg') {
                return 'Use Godot\'s UI nodes for inventory, Resources for game data. Check Godot\'s community tutorials for RPG development.';
            } else if (type === 'shooter') {
                return 'Use Godot\'s RigidBody2D or Area2D for projectiles, signals for shooting. Look into Godot\'s shooter demos.';
            } else if (type === 'farming') {
                return 'Use TileMap node + Timers for growth cycles.';
            } else if (type === 'puzzle') {
                return 'Use a GridContainer or TileMap; signals for tile interactions.';
            } else {
                return 'Utilize Godot\'s node-based architecture for your game. Begin with Godot\'s step-by-step guides.';
            }
        }
        break;
        case 'Unreal': {
            if (type === 'platformer') {
                return 'Use Unreal\'s Paper2D plugin for 2D sprites, Character Movement Component for player. Look into Unreal\'s 2D game tutorials.';
            } else if (type === 'rpg') {
                return 'Use Unreal\'s UMG for user interfaces, Blueprints for game logic. Explore Unreal\'s RPG template.';
            } else if (type === 'shooter') {
                return 'Use Unreal\'s Projectile Movement Component for bullets, Blueprints for firing. Check Unreal\'s shooter templates.';
            } else if (type === 'farming') {
                return 'Use Blueprints + DataTables for crops.';
            } else if (type === 'puzzle') {
                return 'Use Blueprints with a grid of Actors; DataTables for level layouts.';
            } else {
                return 'Take advantage of Unreal\'s Blueprints for rapid prototyping. Start with Unreal\'s learning resources.';
            }
        }
        break;
        case 'Windsurf':
            return 'Since Windsurf is web-focused, use JavaScript with libraries like Phaser.js for game development. Focus on HTML5 Canvas for rendering.';
        break;
        case 'Other':
            return 'Research your chosen tool\'s documentation and community resources for best practices in game development.';
        break;
        default:
            return 'General advice: Follow tutorials and build incrementally.';
    }
}

function generateIdeas() {
    const ideas = [
        {
            name: "Moon Miner Micro",
            vibe: "Lonely, atmospheric, tiny sci‑fi",
            core: "Mine → refine → upgrade",
            scope: "1 level, 3 upgrades",
            why: "Teaches resource loops without overwhelm"
        },
        {
            name: "Night Shift Runner",
            vibe: "Flashlight, footsteps, tension",
            core: "Avoid monster → find keys → escape",
            scope: "1 map, 1 enemy",
            why: "Teaches tension + level design"
        },
        {
            name: "Tiny Farm Plot",
            vibe: "Cozy, simple, Stardew‑lite",
            core: "Plant → grow → harvest",
            scope: "3 crops, 3x3 grid",
            why: "Teaches grids + timers"
        },
        {
            name: "Block Push Basement",
            vibe: "Quiet, brainy, minimal",
            core: "Push blocks → reach goal",
            scope: "3 handcrafted levels",
            why: "Teaches grid logic"
        },
        {
            name: "Neon Dash",
            vibe: "Fast, glowing, synthwave",
            core: "Run → jump → dash",
            scope: "1 level, 1 enemy",
            why: "Teaches movement + collision"
        },
        {
            name: "Micro Dungeon",
            vibe: "Tiny fantasy",
            core: "Fight → loot → upgrade",
            scope: "1 dungeon, 3 items",
            why: "Teaches stats + progression"
        },
        {
            name: "One Room Survival",
            vibe: "Claustrophobic, escalating",
            core: "Gather → craft → survive",
            scope: "1 room, 3 resources",
            why: "Teaches loops + timers"
        },
        {
            name: "Ghost in the Gallery",
            vibe: "Eerie museum",
            core: "Solve puzzles → avoid ghost",
            scope: "1 map, 2 puzzles",
            why: "Teaches pacing + atmosphere"
        },
        {
            name: "Shape Swap",
            vibe: "Bright, friendly",
            core: "Swap shapes → match 3",
            scope: "1 board, 3 tile types",
            why: "Teaches match logic"
        }
    ];
    const shuffled = ideas.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    let html = '<h2>Here are 3 game ideas to spark your creativity!</h2><br><br>';
    selected.forEach(idea => {
        html += `<h3>${idea.name}</h3><p><strong>Vibe:</strong> ${idea.vibe}</p><ul><li><strong>Core Loop:</strong> ${idea.core}</li><li><strong>Scope:</strong> ${idea.scope}</li></ul><p><strong>Why it works:</strong> ${idea.why}</p><br><br>`;
    });
    document.getElementById('output').innerHTML = html;
    document.getElementById('confirmation').innerText = '';
}

document.getElementById('ideas').addEventListener('click', generateIdeas);

document.getElementById('share-page').addEventListener('click', function() {
    const url = 'https://true-scope-fh18tfq5a-jonnys-projects-1bda5611.vercel.app/';
    try {
        window.open(url, '_blank');
    } catch {
        navigator.clipboard.writeText('Check out True Scope - a tool that turns game ideas into tiny buildable plans! https://true-scope-fh18tfq5a-jonnys-projects-1bda5611.vercel.app/').then(() => {
            const conf = document.getElementById('confirmation');
            conf.innerText = 'Share text copied to clipboard!';
            setTimeout(() => conf.innerText = '', 2000);
        });
    }
});

document.getElementById('share-output').addEventListener('click', function() {
    const output = document.getElementById('output');
    const conf = document.getElementById('confirmation');
    if (output.innerText.trim() === '' || output.innerText === 'Your plan will appear here. Try typing an idea or click \'Give me an idea\' to start.') {
        conf.innerText = 'Nothing to share yet!';
        setTimeout(() => conf.innerText = '', 2000);
        return;
    }
    const text = encodeURIComponent(output.innerText);
    const shareUrl = `https://twitter.com/intent/tweet?text=Here%20is%20my%20game%20plan%20from%20True%20Scope:%0A%0A${text}`;
    try {
        window.open(shareUrl, '_blank');
    } catch {
        navigator.clipboard.writeText(`Here is my game plan from True Scope:\n\n${output.innerText}`).then(() => {
            conf.innerText = 'Share text copied to clipboard!';
            setTimeout(() => conf.innerText = '', 2000);
        });
    }
});

document.getElementById('output').innerHTML = '<p>🎮 Your game plan will appear here! Type an idea above or click "💡 Give Me Game Ideas" to get started!</p>';

// Voice input functionality
const voiceBtn = document.getElementById('voice-btn');
const voiceStatus = document.getElementById('voice-status');
const ideaTextarea = document.getElementById('idea');

// Check if browser supports speech recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = function() {
        voiceBtn.classList.add('recording');
        voiceStatus.textContent = '🎤 Listening... Speak now!';
        voiceBtn.innerHTML = '⏹️';
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        ideaTextarea.value = transcript;
        voiceStatus.textContent = '✅ Voice input added!';
        setTimeout(() => {
            voiceStatus.textContent = '';
        }, 2000);
    };
    
    recognition.onerror = function(event) {
        voiceStatus.textContent = '❌ Voice error: ' + event.error;
        setTimeout(() => {
            voiceStatus.textContent = '';
        }, 3000);
    };
    
    recognition.onend = function() {
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '🎤';
    };
    
    voiceBtn.addEventListener('click', function() {
        if (voiceBtn.classList.contains('recording')) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
} else {
    voiceBtn.style.display = 'none';
    voiceStatus.textContent = '📝 Voice input not supported in this browser';
}

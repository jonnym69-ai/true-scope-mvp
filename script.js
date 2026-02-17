// Global user state
let currentUser = null;
let userSubscription = null;
let userUsageToday = 0;
const DAILY_LIMIT_FREE = 3;

document.getElementById('generate').addEventListener('click', function() {
    // Check if user is logged in
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    // Check usage limits for free users
    if (userSubscription === 'free' && userUsageToday >= DAILY_LIMIT_FREE) {
        const conf = document.getElementById('confirmation');
        conf.innerHTML = '⚠️ Daily limit reached! <a href="#" onclick="document.getElementById(\'upgrade-btn\').click()">Upgrade to Pro</a> for unlimited plans.';
        setTimeout(() => conf.innerText = '', 8000);
        return;
    }
    
    const generateBtn = document.getElementById('generate');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Thinking...';
    document.getElementById('loading').style.display = 'block';
    
    setTimeout(async () => {
        const idea = document.getElementById('idea').value.trim().toLowerCase();
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

        const plan = await generatePlan(idea, planType, tool);
        document.getElementById('output').innerHTML = plan;
        document.getElementById('loading').style.display = 'none';
        generateBtn.disabled = false;
        generateBtn.textContent = '🎮 Generate My Game Plan';
        
        // Update usage
        userUsageToday++;
        await updateUserData({ 
            usageToday: userUsageToday,
            totalUsage: (await getUserData('totalUsage') || 0) + 1,
            lastUsageDate: new Date().toDateString()
        });
        
        // Update UI
        updateUIForUser();
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

async function generatePlan(userIdea, planType, tool) {
    try {
        // Check user subscription for premium features
        const isPremium = userSubscription === 'premium' || userSubscription === 'pro';

        // Get selected format (default to standard for free users)
        const selectedFormat = isPremium ? document.getElementById('plan-format').value : 'standard';

        // Enhanced professional prompt for premium users
        const systemPrompt = isPremium ?
            'You are a senior game development consultant and technical director. Create comprehensive, professional-quality game development plans suitable for indie studios and professional teams. Include detailed technical specifications, realistic timelines, budget estimates, risk assessments, and business considerations. Structure plans like industry-standard game design documents.' :
            'You are a game development expert. Create detailed, actionable game development plans for indie developers. Focus on tiny, achievable scopes that can be built in 1-2 weeks. Include technical advice, timeline, and folder structure.';

        // Format-specific prompts for premium users
        let userPrompt;
        if (isPremium) {
            switch (selectedFormat) {
                case 'technical':
                    userPrompt = `Create a detailed Technical Specification Document for: "${userIdea}"

GAME TYPE: ${planType}
DEVELOPMENT TOOL: ${tool}

Structure as a Technical Spec with:
🔧 SYSTEM REQUIREMENTS
- Minimum & Recommended Hardware Specs
- Software Dependencies
- Development Environment Setup

🏗️ ARCHITECTURE DESIGN
- High-level System Architecture
- Component Breakdown
- Data Flow Diagrams (described in text)
- API Design & Integration Points

🎮 GAME SYSTEMS SPECIFICATION
- Core Gameplay Systems
- Physics & Collision Systems
- Audio System Requirements
- UI/UX Technical Requirements

📊 PERFORMANCE TARGETS
- Frame Rate Requirements (FPS)
- Load Times & Optimization Goals
- Memory Usage Limits
- Platform-Specific Considerations

🧪 TESTING & QA SPECIFICATIONS
- Unit Testing Requirements
- Integration Testing Plan
- Performance Testing Criteria
- Bug Tracking & Resolution Process

Format this as a professional technical specification document.`;
                    break;

                case 'pitch':
                    userPrompt = `Create a compelling Pitch Deck presentation for: "${userIdea}"

GAME TYPE: ${planType}
DEVELOPMENT TOOL: ${tool}

Structure as a 10-15 slide pitch deck with these sections:

📈 SLIDE 1: TITLE & HOOK
- Catchy game title
- One-sentence description
- Visual concept

🎯 SLIDE 2: PROBLEM & SOLUTION
- Market gap or player pain point
- How your game solves it
- Unique value proposition

👥 SLIDE 3: TARGET AUDIENCE
- Primary player demographics
- Secondary audiences
- Market size estimates

🎮 SLIDE 4: GAME MECHANICS
- Core gameplay loop
- Key features (3-5 main ones)
- Player progression

💰 SLIDE 5: MONETIZATION STRATEGY
- Revenue model (ads, IAP, subscriptions, etc.)
- Pricing strategy
- Projected revenue streams

📊 SLIDE 6: MARKET ANALYSIS
- Competitive landscape
- Market trends
- Your competitive advantage

👨‍💼 SLIDE 7: TEAM & DEVELOPMENT
- Key team members
- Development timeline
- Technology stack

📈 SLIDE 8: FINANCIAL PROJECTIONS
- Development budget
- Launch timeline
- Revenue projections (3-year)

🎯 SLIDE 9: MARKETING & LAUNCH PLAN
- Marketing strategy
- Launch platforms
- Go-to-market timeline

🏆 SLIDE 10: CALL TO ACTION
- Investment ask (if applicable)
- Next steps
- Contact information

Format each slide clearly with titles, bullet points, and compelling content.`;
                    break;

                case 'business':
                    userPrompt = `Create a comprehensive Business Plan for: "${userIdea}"

GAME TYPE: ${planType}
DEVELOPMENT TOOL: ${tool}

Structure as a professional business plan with:

📋 EXECUTIVE SUMMARY
- Game concept overview
- Mission statement
- Financial projections summary
- Funding requirements

🎮 COMPANY & PRODUCT DESCRIPTION
- Company overview (your indie studio)
- Product description & features
- Development stage & timeline
- Intellectual property status

📊 INDUSTRY & MARKET ANALYSIS
- Game industry overview
- Target market analysis
- Market size & growth projections
- Competitive analysis (direct & indirect competitors)

👥 MARKETING & SALES STRATEGY
- Marketing plan & channels
- Sales strategy & distribution
- Pricing strategy
- Customer acquisition plan

💼 OPERATIONS PLAN
- Development team structure
- Technology requirements
- Development timeline & milestones
- Risk management plan

💰 FINANCIAL PLAN
- Startup costs breakdown
- Operating expenses (monthly/annual)
- Revenue projections (Year 1-3)
- Break-even analysis
- Funding requirements & use of funds

🎯 FUNDING REQUEST (if applicable)
- Amount requested
- Use of funds
- Repayment terms
- Exit strategy

Format this as a professional business plan with realistic financial projections and market analysis.`;
                    break;

                case 'timeline':
                    userPrompt = `Create a detailed Project Timeline & Milestones for: "${userIdea}"

GAME TYPE: ${planType}
DEVELOPMENT TOOL: ${tool}

Structure as a comprehensive project timeline with:

📅 PROJECT OVERVIEW
- Total project duration estimate
- Major phases breakdown
- Key milestones & deliverables

🏗️ PHASE 1: PRE-PRODUCTION (Weeks 1-4)
- Concept development & refinement
- Market research & competitive analysis
- Technical feasibility assessment
- Team assembly & resource planning

🎨 PHASE 2: PROTOTYPE DEVELOPMENT (Weeks 5-8)
- Core mechanics prototyping
- Technical architecture setup
- Initial art & audio assets
- Playtesting & iteration

🏗️ PHASE 3: PRODUCTION (Weeks 9-20)
- Full game development
- Asset creation pipeline
- Feature implementation
- Regular playtesting sessions

✨ PHASE 4: POLISH & OPTIMIZATION (Weeks 21-24)
- Performance optimization
- Bug fixing & stability improvements
- UI/UX refinements
- Final art & audio polish

🚀 PHASE 5: LAUNCH PREPARATION (Weeks 25-26)
- Marketing materials creation
- Store page preparation
- Beta testing coordination
- Launch checklist completion

📊 PHASE 6: LAUNCH & POST-LAUNCH (Ongoing)
- App store submissions
- Marketing campaign execution
- User feedback collection
- Update planning & bug fixes

Format with specific weeks, deliverables, responsible parties, and success criteria for each milestone.`;
                    break;

                case 'budget':
                    userPrompt = `Create a detailed Budget Breakdown for: "${userIdea}"

GAME TYPE: ${planType}
DEVELOPMENT TOOL: ${tool}

Structure as a comprehensive budget analysis with:

💰 DEVELOPMENT BUDGET OVERVIEW
- Total estimated budget
- Development timeline assumption
- Team size & composition
- Cost breakdown categories

👥 PERSONNEL COSTS
- Lead Developer salary/rate
- Additional programmers
- Artists & animators
- Sound designer & composer
- QA testers
- Project manager (if applicable)

🛠️ SOFTWARE & TOOLS
- Development engine licenses
- Art & design software
- Audio production tools
- Version control & collaboration tools
- Testing & analytics platforms
- Marketing tools

🎨 ART & AUDIO ASSETS
- Character design & animation
- Environment art & assets
- UI/UX design
- Sound effects & music composition
- Voice acting (if applicable)

📱 PLATFORM & DISTRIBUTION FEES
- App store fees (Apple, Google)
- Console publishing fees (if applicable)
- Payment processing fees
- Server hosting costs

📢 MARKETING & LAUNCH COSTS
- Marketing campaign budget
- App store optimization
- Community management
- Influencer partnerships
- PR & media outreach

⚡ CONTINGENCY & MISCELLANEOUS
- Unexpected development costs
- Legal fees & IP protection
- Insurance & business expenses
- Hardware upgrades
- Professional services (consulting, etc.)

📊 BUDGET TIMELINE BREAKDOWN
- Month-by-month spending projections
- Cash flow analysis
- Funding milestone recommendations

Format with realistic cost estimates, assumptions clearly stated, and contingency planning.`;
                    break;

                default: // standard professional plan
                    userPrompt = `Create a comprehensive professional game development plan for: "${userIdea}"

GAME TYPE: ${planType}
DEVELOPMENT TOOL: ${tool}

Please structure this as a complete Game Design Document with the following sections:

🎯 EXECUTIVE SUMMARY
- Game concept overview
- Target audience and market positioning
- Unique value proposition
- High-level goals and success metrics

🎮 GAME DESIGN
- Core gameplay mechanics (detailed)
- Player progression systems
- Win/lose conditions
- Level/world design concepts

💻 TECHNICAL SPECIFICATIONS
- Technology stack and requirements
- Performance targets (FPS, load times, etc.)
- Platform specifications
- Third-party integrations needed

👥 DEVELOPMENT PLAN
- Detailed timeline (realistic 2-6 month schedule)
- Milestone breakdown with deliverables
- Team requirements and roles
- Development phases (Pre-production, Production, Polish, Launch)

💰 BUDGET & RESOURCES
- Estimated development budget breakdown
- Asset requirements (art, audio, etc.)
- Tool subscriptions and costs
- Outsourcing considerations

📊 BUSINESS & MONETIZATION
- Revenue model and pricing strategy
- Marketing and launch plan
- Competitive analysis
- Risk assessment and mitigation

🛠️ TECHNICAL IMPLEMENTATION
- Architecture overview
- Key systems design
- Performance optimization plan
- Testing and QA strategy

Format this professionally with clear sections, bullet points, and actionable details.`;
            }
        } else {
            userPrompt = `Create a detailed game development plan for: ${userIdea}. Game type: ${planType}. Development tool: ${tool}. Make it achievable for beginners, with step-by-step instructions, technical advice, and realistic timeline. Include folder structure and tool-specific tips.`;
        }

        // Use OpenAI API to generate dynamic game plan
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer YOUR_OPENAI_API_KEY` // Replace with actual key
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                max_tokens: isPremium ? (selectedFormat === 'business' || selectedFormat === 'budget' ? 3000 : 2500) : 1500, // More tokens for complex formats
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error('AI service unavailable');
        }
        
        const data = await response.json();
        const aiPlan = data.choices[0].message.content;
        
        // Format AI response as HTML
        return `<h2>🎮 Your AI-Generated Game Plan</h2><br><br><div class="ai-plan">${aiPlan}</div>`;
    } catch (error) {
        return `<h2>🤖 AI Service Unavailable</h2><br><br><p>Sorry, the AI service is currently unavailable. Please try again later.</p>`;
    }
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

document.getElementById('view-portfolio').addEventListener('click', function() {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    if (userSubscription === 'free') {
        alert('Viewing your portfolio is a Premium feature. Upgrade to access your saved game plans!');
        document.getElementById('upgrade-btn').click();
        return;
    }
    
    showPortfolioModal();
});

document.getElementById('save-plan').addEventListener('click', async function() {
    const output = document.getElementById('output');
    const confirmation = document.getElementById('confirmation');
    
    if (!currentUser) {
        confirmation.innerText = 'Please sign in to save plans!';
        setTimeout(() => confirmation.innerText = '', 3000);
        return;
    }
    
    if (userSubscription === 'free') {
        confirmation.innerHTML = 'Saving plans to portfolio is a Premium feature! <a href="#" onclick="document.getElementById(\'upgrade-btn\').click()">Upgrade now</a> to save and organize your game plans.';
        setTimeout(() => confirmation.innerText = '', 5000);
        return;
    }
    
    if (output.innerText.trim() === '' || output.innerText === 'Your plan will appear here. Try typing an idea or click \'Give me an idea\' to start.') {
        confirmation.innerText = 'No plan to save! Generate a plan first.';
        setTimeout(() => confirmation.innerText = '', 3000);
        return;
    }
    
    try {
        // Get plan title from user
        const planTitle = prompt('Enter a name for this plan:', 'My Game Plan');
        if (!planTitle || planTitle.trim() === '') {
            confirmation.innerText = 'Plan not saved - no title provided.';
            setTimeout(() => confirmation.innerText = '', 3000);
            return;
        }
        
        // Save plan to Firestore
        const planData = {
            title: planTitle.trim(),
            content: output.innerHTML,
            textContent: output.innerText,
            idea: document.getElementById('idea').value,
            tool: document.getElementById('tool').value,
            format: document.getElementById('plan-format') ? document.getElementById('plan-format').value : 'standard',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        await savePlanToPortfolio(planData);
        
        confirmation.innerText = `✅ Plan "${planTitle}" saved to your portfolio!`;
        setTimeout(() => confirmation.innerText = '', 3000);
        
    } catch (error) {
        console.error('Error saving plan:', error);
        confirmation.innerText = '❌ Failed to save plan. Please try again.';
        setTimeout(() => confirmation.innerText = '', 3000);
    }
});

document.getElementById('business-intelligence').addEventListener('click', function() {
    // Check if user is logged in
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    // Check if user is premium
    if (userSubscription === 'free') {
        alert('Business Intelligence Analysis is a Premium feature. Upgrade to access market analysis, revenue projections, and competitive insights!');
        document.getElementById('upgrade-btn').click();
        return;
    }
    
    const generateBtn = document.getElementById('generate');
    generateBtn.disabled = true;
    document.getElementById('loading').style.display = 'block';
    
    setTimeout(async () => {
        const idea = document.getElementById('idea').value.trim().toLowerCase();
        const tool = document.getElementById('tool').value;
        
        if (!idea) {
            alert('Please enter a game idea first!');
            document.getElementById('loading').style.display = 'none';
            generateBtn.disabled = false;
            return;
        }
        
        const biAnalysis = await generateBusinessIntelligence(idea, tool);
        document.getElementById('output').innerHTML = biAnalysis;
        document.getElementById('loading').style.display = 'none';
        generateBtn.disabled = false;
    }, 600);
});

// Wait for DOM to be ready before adding event listeners
document.addEventListener('DOMContentLoaded', function() {
    const shareOutputBtn = document.getElementById('share-output');
    if (shareOutputBtn) {
        shareOutputBtn.addEventListener('click', function() {
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

// ===== BUSINESS INTELLIGENCE ANALYSIS =====

// ===== PORTFOLIO MANAGEMENT =====

// Save plan to user's portfolio in Firestore
async function savePlanToPortfolio(planData) {
    if (!currentUser) throw new Error('User not authenticated');
    
    const { collection, addDoc } = window.firebaseFunctions;
    
    // Save to user's plans subcollection
    const plansRef = collection(window.firebaseDb, 'users', currentUser.uid, 'plans');
    
    await addDoc(plansRef, {
        ...planData,
        createdAt: new Date(),
        updatedAt: new Date()
    });
}

// Load user's portfolio plans
async function loadUserPortfolio() {
    if (!currentUser) return [];
    
    try {
        const { collection, query, orderBy, getDocs } = window.firebaseFunctions;
        const plansRef = collection(window.firebaseDb, 'users', currentUser.uid, 'plans');
        const q = query(plansRef, orderBy('createdAt', 'desc'));
        
        const querySnapshot = await getDocs(q);
        const plans = [];
        
        querySnapshot.forEach((doc) => {
            plans.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return plans;
    } catch (error) {
        console.error('Error loading portfolio:', error);
        return [];
    }
}

// Display portfolio modal for premium users
function showPortfolioModal() {
    // Create portfolio modal if it doesn't exist
    let portfolioModal = document.getElementById('portfolio-modal');
    if (!portfolioModal) {
        portfolioModal = document.createElement('div');
        portfolioModal.id = 'portfolio-modal';
        portfolioModal.className = 'portfolio-modal';
        portfolioModal.innerHTML = `
            <div class="portfolio-modal-content">
                <h2>🎮 Your Game Plan Portfolio</h2>
                <div id="portfolio-list">
                    <p>Loading your plans...</p>
                </div>
                <button id="close-portfolio">Close</button>
            </div>
        `;
        document.body.appendChild(portfolioModal);
        
        // Add close handler
        document.getElementById('close-portfolio').addEventListener('click', () => {
            portfolioModal.style.display = 'none';
        });
    }
    
    // Load and display portfolio
    loadUserPortfolio().then(plans => {
        const portfolioList = document.getElementById('portfolio-list');
        
        if (plans.length === 0) {
            portfolioList.innerHTML = '<p>You haven\'t saved any plans yet. Generate and save some plans to build your portfolio!</p>';
        } else {
            let html = `<p>You have ${plans.length} saved plan${plans.length > 1 ? 's' : ''}:</p><br>`;
            
            plans.forEach(plan => {
                const createdDate = new Date(plan.createdAt.seconds * 1000).toLocaleDateString();
                html += `
                    <div class="portfolio-item">
                        <h3>${plan.title}</h3>
                        <p><strong>Idea:</strong> ${plan.idea || 'N/A'}</p>
                        <p><strong>Tool:</strong> ${plan.tool || 'N/A'}</p>
                        <p><strong>Format:</strong> ${plan.format || 'standard'}</p>
                        <p><strong>Created:</strong> ${createdDate}</p>
                        <div class="portfolio-actions">
                            <button onclick="viewPortfolioPlan('${plan.id}')">👁️ View</button>
                            <button onclick="deletePortfolioPlan('${plan.id}')">🗑️ Delete</button>
                        </div>
                    </div>
                    <hr>
                `;
            });
            
            portfolioList.innerHTML = html;
        }
    });
    
    portfolioModal.style.display = 'flex';
}

// View a specific plan from portfolio
async function viewPortfolioPlan(planId) {
    try {
        const plans = await loadUserPortfolio();
        const plan = plans.find(p => p.id === planId);
        
        if (plan) {
            document.getElementById('output').innerHTML = plan.content;
            document.getElementById('portfolio-modal').style.display = 'none';
            document.getElementById('confirmation').innerText = `Loaded "${plan.title}" from your portfolio!`;
            setTimeout(() => document.getElementById('confirmation').innerText = '', 3000);
        }
    } catch (error) {
        console.error('Error viewing plan:', error);
        alert('Failed to load plan. Please try again.');
    }
}

// Delete a plan from portfolio
async function deletePortfolioPlan(planId) {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
        return;
    }
    
    try {
        const { doc, deleteDoc } = window.firebaseFunctions;
        const planRef = doc(window.firebaseDb, 'users', currentUser.uid, 'plans', planId);
        
        await deleteDoc(planRef);
        
        // Refresh portfolio view
        showPortfolioModal();
        
        document.getElementById('confirmation').innerText = 'Plan deleted from portfolio!';
        setTimeout(() => document.getElementById('confirmation').innerText = '', 3000);
        
    } catch (error) {
        console.error('Error deleting plan:', error);
        alert('Failed to delete plan. Please try again.');
    }
}

// Handle subscription tier dropdown changes
document.getElementById('subscription-tier').addEventListener('change', function(e) {
    const selectedTier = e.target.value;
    updateUserSubscription(selectedTier);
    
    if (selectedTier !== 'free') {
        document.getElementById('confirmation').innerText = `✅ Switched to ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} plan!`;
        setTimeout(() => document.getElementById('confirmation').innerText = '', 3000);
    }
});

// Update upgrade button to handle real Stripe checkout
document.getElementById('upgrade-btn').addEventListener('click', async function() {
    const selectedTier = document.getElementById('subscription-tier').value;
    
    if (selectedTier === 'free') {
        alert('Please select a premium plan to upgrade!');
        return;
    }
    
    try {
        // Show loading
        this.disabled = true;
        this.innerText = 'Processing...';
        
        // Call Stripe checkout session API
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tier: selectedTier,
                userId: currentUser ? currentUser.uid : null
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }
        
        const { url } = await response.json();
        
        // Redirect to Stripe Checkout
        window.location.href = url;
        
    } catch (error) {
        console.error('Error creating checkout session:', error);
        alert('Failed to start checkout. Please try again.');
        
        // Reset button
        this.disabled = false;
        this.innerText = 'Upgrade Now';
    }
});

// ===== FREEMIUM AUTHENTICATION & USER MANAGEMENT =====

// Initialize app when Firebase loads
window.addEventListener('load', () => {
    // Show auth modal immediately for testing
    showAuthModal();
    
    // Wait for Firebase to be available
    setTimeout(() => {
        if (window.firebaseAuth) {
            initializeAuth();
        } else {
            console.error('Firebase not loaded');
        }
    }, 1000);
});

// Initialize authentication
function initializeAuth() {
    const { onAuthStateChanged } = window.firebaseFunctions;
    
    onAuthStateChanged(window.firebaseAuth, async (user) => {
        currentUser = user;
        
        if (user) {
            // User is signed in
            await loadUserData();
            showMainApp();
        } else {
            // User is signed out
            showAuthModal();
        }
    });
}

// Load user data from Firestore
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        const { doc, getDoc } = window.firebaseFunctions;
        const userDoc = await getDoc(doc(window.firebaseDb, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            userSubscription = userData.subscription || 'free';
            userUsageToday = userData.usageToday || 0;
            
            // Reset usage if it's a new day
            const lastUsageDate = userData.lastUsageDate;
            const today = new Date().toDateString();
            if (lastUsageDate !== today) {
                userUsageToday = 0;
                await updateUserData({ usageToday: 0, lastUsageDate: today });
            }
        } else {
            // New user
            await createUserData();
        }
        
        updateUIForUser();
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Create new user data
async function createUserData() {
    const { setDoc, doc } = window.firebaseFunctions;
    const userData = {
        email: currentUser.email,
        subscription: 'free',
        usageToday: 0,
        totalUsage: 0,
        createdAt: new Date(),
        lastUsageDate: new Date().toDateString()
    };
    
    await setDoc(doc(window.firebaseDb, 'users', currentUser.uid), userData);
    userSubscription = 'free';
    userUsageToday = 0;
}

// Update user data in Firestore
async function updateUserData(updates) {
    if (!currentUser) return;
    
    const { updateDoc, doc } = window.firebaseFunctions;
    await updateDoc(doc(window.firebaseDb, 'users', currentUser.uid), updates);
}

// Get specific user data field
async function getUserData(field) {
    if (!currentUser) return null;
    
    try {
        const { doc, getDoc } = window.firebaseFunctions;
        const userDoc = await getDoc(doc(window.firebaseDb, 'users', currentUser.uid));
        return userDoc.exists() ? userDoc.data()[field] : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Update UI based on user state
function updateUIForUser() {
    // Update premium banner
    const banner = document.getElementById('premium-banner');
    if (userSubscription === 'free') {
        banner.style.display = 'block';
    } else {
        banner.style.display = 'none';
    }
    
    // Show/hide premium features
    const formatSelection = document.getElementById('format-selection');
    const businessIntelligenceBtn = document.getElementById('business-intelligence');
    const savePlanBtn = document.getElementById('save-plan');
    const viewPortfolioBtn = document.getElementById('view-portfolio');
    
    if (userSubscription === 'premium' || userSubscription === 'pro') {
        formatSelection.style.display = 'block';
        businessIntelligenceBtn.style.display = 'block';
        savePlanBtn.style.display = 'block';
        viewPortfolioBtn.style.display = 'block';
    } else {
        formatSelection.style.display = 'none';
        businessIntelligenceBtn.style.display = 'none';
        savePlanBtn.style.display = 'none';
        viewPortfolioBtn.style.display = 'none';
    }
    
    // Add user account info
    addUserAccountUI();
    
    // Add usage limits for free users
    if (userSubscription === 'free') {
        addUsageLimitUI();
    }
    
    // Gate premium features
    gatePremiumFeatures();
}

// Add user account UI
function addUserAccountUI() {
    // Remove existing account UI
    const existing = document.querySelector('.user-account');
    if (existing) existing.remove();
    
    if (!currentUser) return;
    
    const accountDiv = document.createElement('div');
    accountDiv.className = 'user-account';
    accountDiv.innerHTML = `
        <div class="user-info">${currentUser.email} (${userSubscription})</div>
        <button class="logout-btn" onclick="logoutUser()">Logout</button>
    `;
    
    document.querySelector('.container').appendChild(accountDiv);
}

// Add usage limit UI for free users
function addUsageLimitUI() {
    const existing = document.querySelector('.usage-limit');
    if (existing) existing.remove();
    
    const remaining = DAILY_LIMIT_FREE - userUsageToday;
    if (remaining <= 0) {
        const limitDiv = document.createElement('div');
        limitDiv.className = 'usage-limit';
        limitDiv.innerHTML = '⚠️ Daily limit reached! <a href="#" onclick="upgradeToPro()">Upgrade to Pro</a> for unlimited plans.';
        document.querySelector('main').insertBefore(limitDiv, document.querySelector('main').firstChild);
    } else {
        const limitDiv = document.createElement('div');
        limitDiv.className = 'usage-limit';
        limitDiv.innerHTML = `📊 ${remaining} free plans remaining today`;
        document.querySelector('main').insertBefore(limitDiv, document.querySelector('main').firstChild);
    }
}

// Gate premium features
function gatePremiumFeatures() {
    // PDF export button (will be added later)
    // For now, just update the copy button behavior
    const copyBtn = document.getElementById('copy');
    if (userSubscription === 'free') {
        copyBtn.title = 'Copy to clipboard (Pro users get PDF export)';
    } else {
        copyBtn.title = 'Copy to clipboard';
    }
}

// Show auth modal
function showAuthModal() {
    document.getElementById('auth-modal').style.display = 'flex';
    document.querySelector('.container').style.display = 'none';
    document.getElementById('premium-banner').style.display = 'none';
}

// Show main app
function showMainApp() {
    document.getElementById('auth-modal').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
}

// Logout user
function logoutUser() {
    const { signOut } = window.firebaseFunctions;
    signOut(window.firebaseAuth).then(() => {
        currentUser = null;
        userSubscription = null;
        userUsageToday = 0;
        location.reload(); // Refresh to reset UI
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}

// Upgrade to Pro (show tier selection)
function upgradeToPro() {
    if (!currentUser) {
        alert('Please sign in first to upgrade!');
        return;
    }
    
    showTierSelection();
}

// Show tier selection modal
function showTierSelection() {
    document.getElementById('tier-modal').style.display = 'flex';
    document.querySelector('.container').style.display = 'none';
    document.getElementById('premium-banner').style.display = 'none';
    document.getElementById('auth-modal').style.display = 'none';
}

// Handle tier selection and payment
function selectTier(tier) {
    const tierPrices = {
        'premium': {
            priceId: 'price_premium_tier',
            amount: '$4.99/month',
            features: ['Unlimited basic plans', 'PDF export', 'Save plans']
        },
        'pro': {
            priceId: 'price_pro_tier', 
            amount: '$9.99/month',
            features: ['Everything in Premium', 'Detailed professional plans', 'Multiple formats', 'Business intelligence', 'Portfolio builder', 'Advanced customization']
        }
    };
    
    const selectedTier = tierPrices[tier];
    if (!selectedTier) return;
    
    // Show confirmation
    const confirmMessage = `Upgrade to ${tier.toUpperCase()} tier for ${selectedTier.amount}?\n\nFeatures included:\n${selectedTier.features.map(f => '• ' + f).join('\n')}`;
    
    if (confirm(confirmMessage)) {
        // Here you would integrate with Stripe
        alert(`Redirecting to payment for ${tier.toUpperCase()} tier...\n\nIn production, this would connect to Stripe Checkout with price ID: ${selectedTier.priceId}`);
        
        // Close modal
        document.getElementById('tier-modal').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
    }
}

// Auth event handlers
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    document.getElementById('login-btn').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const { signInWithEmailAndPassword } = window.firebaseFunctions;
            await signInWithEmailAndPassword(window.firebaseAuth, email, password);
            document.getElementById('auth-error').style.display = 'none';
        } catch (error) {
            document.getElementById('auth-error').style.display = 'block';
            document.getElementById('auth-error').textContent = error.message;
        }
    });
    
    // Signup form
    document.getElementById('signup-btn').addEventListener('click', async () => {
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        try {
            const { createUserWithEmailAndPassword } = window.firebaseFunctions;
            await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
            document.getElementById('auth-error').style.display = 'none';
        } catch (error) {
            document.getElementById('auth-error').style.display = 'block';
            document.getElementById('auth-error').textContent = error.message;
        }
    });
    
    // Form switching
    document.getElementById('show-signup').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
    
    // Upgrade button
    document.getElementById('upgrade-btn').addEventListener('click', () => {
        upgradeToPro();
    });
    
    // Tier selection
    document.getElementById('select-tier-btn').addEventListener('click', () => {
        // For demo, show tier options
        const tierChoice = prompt('Choose tier (premium/pro):');
        if (tierChoice) {
            selectTier(tierChoice.toLowerCase());
        }
    });
});

// ===== STRIPE PAYMENT INTEGRATION =====

// Create Stripe checkout session
async function createStripeCheckout() {
    try {
        const response = await fetch('https://true-scope-mvp.vercel.app/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId: 'price_1O2H3R2eZvKYlo2C5xL2Z', // Pro subscription price ID
                successUrl: window.location.origin + '/success.html',
                cancelUrl: window.location.origin + '/cancel.html',
            }),
        });
        
        const session = await response.json();
        
        // Redirect to Stripe Checkout
        const result = await stripeInstance.redirectToCheckout({ sessionId: session.id });
        
        if (result.error) {
            console.error('Stripe error:', result.error.message);
            alert('Payment failed. Please try again.');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Unable to start payment. Please try again.');
    }
}

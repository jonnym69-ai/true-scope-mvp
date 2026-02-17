// Global user state
let currentUser = null;
let userSubscription = null;
let userUsageToday = 0;
const DAILY_LIMIT_FREE = 3;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Generate button
    const generateBtn = document.getElementById('generate');
    if (generateBtn) {
        generateBtn.addEventListener('click', async function() {
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
    }

    // Copy button
    const copyBtn = document.getElementById('copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const output = document.getElementById('output');
            const text = output.innerText;
            navigator.clipboard.writeText(text).then(() => {
                const conf = document.getElementById('confirmation');
                conf.innerHTML = '✅ Plan copied! <strong>Next steps:</strong> Save it somewhere, share it, or start building your game! 🎮';
                setTimeout(() => conf.innerText = '', 5000);
            });
        });
    }

    // Reset button
    const resetBtn = document.getElementById('reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
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
    }

    // Ideas button
    const ideasBtn = document.getElementById('ideas');
    if (ideasBtn) {
        ideasBtn.addEventListener('click', generateIdeas);
    }

    // View portfolio button
    const viewPortfolioBtn = document.getElementById('view-portfolio');
    if (viewPortfolioBtn) {
        viewPortfolioBtn.addEventListener('click', function() {
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
    }

    // Save plan button
    const savePlanBtn = document.getElementById('save-plan');
    if (savePlanBtn) {
        savePlanBtn.addEventListener('click', async function() {
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
    }

    // Business intelligence button
    const businessIntelligenceBtn = document.getElementById('business-intelligence');
    if (businessIntelligenceBtn) {
        businessIntelligenceBtn.addEventListener('click', function() {
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
    }

    // Upgrade button
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', async function() {
            // Stripe pricing table handles the checkout, just show confirmation
            const conf = document.getElementById('confirmation');
            conf.innerText = '🚀 Use the Stripe pricing table below to upgrade!';
            setTimeout(() => conf.innerText = '', 3000);
        });
    }

    // Voice input functionality
    const voiceBtn = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    const ideaTextarea = document.getElementById('idea');

    if (voiceBtn && voiceStatus && ideaTextarea) {
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
    }

    // Initialize output
    const output = document.getElementById('output');
    if (output) {
        output.innerHTML = '<p>🎮 Your game plan will appear here! Type an idea above or click "💡 Give Me Game Ideas" to get started!</p>';
    }

    // Initialize authentication
    initializeAuth();

// Generate ideas function
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

// Generate plan function
async function generatePlan(userIdea, planType, tool) {
    try {
        // Check user subscription for premium features
        const isPremium = userSubscription === 'premium' || userSubscription === 'pro';

        // Get selected format (default to standard for free users)
        const selectedFormat = isPremium && document.getElementById('plan-format') ? document.getElementById('plan-format').value : 'standard';

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
        // Note: Add OPENAI_API_KEY to your Vercel environment variables
        const apiKey = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';
        
        if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
            return `<h2>🤖 AI Service Unavailable</h2><br><br><p>AI service requires API key. Please contact administrator.</p>`;
        }
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
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
                max_tokens: isPremium ? 2000 : 1500,
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

// Generate business intelligence function
async function generateBusinessIntelligence(idea, tool) {
    // Mock business intelligence analysis
    return `
        <h2>📊 Business Intelligence Analysis</h2>
        <h3>Market Analysis for "${idea}"</h3>
        <div class="bi-section">
            <h4>🎯 Target Market</h4>
            <p>Based on your game concept, the primary target audience appears to be indie game enthusiasts aged 18-35 who enjoy ${idea.includes('puzzle') ? 'brain-teasing challenges' : idea.includes('rpg') ? 'story-driven experiences' : 'action-oriented gameplay'}.</p>
            
            <h4>📈 Market Size</h4>
            <p>The indie game market represents approximately $XX billion annually, with niche segments for ${tool}-based games showing strong growth potential.</p>
            
            <h4>🏆 Competitive Landscape</h4>
            <p>Key competitors include established titles in the ${idea.includes('puzzle') ? 'puzzle' : idea.includes('rpg') ? 'RPG' : 'action'} genre. Your unique value proposition focuses on ${idea.includes('tiny') ? 'minimalist, achievable scope' : 'innovative mechanics'}.</p>
        </div>
        
        <div class="bi-section">
            <h4>💰 Revenue Projections</h4>
            <p><strong>Year 1:</strong> $XX,XXX - $XX,XXX</p>
            <p><strong>Year 2:</strong> $XX,XXX - $XX,XXX</p>
            <p><strong>Year 3:</strong> $XX,XXX - $XX,XXX</p>
            
            <h4>🎮 Monetization Strategy</h4>
            <p>Recommended approach: Premium pricing ($X.XX) with potential for DLC/expansions based on market reception.</p>
        </div>
        
        <div class="bi-section">
            <h4>🚀 Launch Strategy</h4>
            <p><strong>Phase 1:</strong> Soft launch on ${tool} marketplace</p>
            <p><strong>Phase 2:</strong> Marketing push targeting indie game communities</p>
            <p><strong>Phase 3:</strong> Platform expansion based on performance</p>
        </div>
    `;
}

// Portfolio management functions
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
        const closeBtn = document.getElementById('close-portfolio');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                portfolioModal.style.display = 'none';
            });
        }
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

async function viewPortfolioPlan(planId) {
    try {
        const plans = await loadUserPortfolio();
        const plan = plans.find(p => p.id === planId);
        
        if (plan) {
            document.getElementById('output').innerHTML = plan.content;
            const portfolioModal = document.getElementById('portfolio-modal');
            if (portfolioModal) {
                portfolioModal.style.display = 'none';
            }
            document.getElementById('confirmation').innerText = `Loaded "${plan.title}" from your portfolio!`;
            setTimeout(() => document.getElementById('confirmation').innerText = '', 3000);
        }
    } catch (error) {
        console.error('Error viewing plan:', error);
        alert('Failed to load plan. Please try again.');
    }
}

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

// User data functions
async function updateUserData(updates) {
    if (!currentUser) return;
    
    const { updateDoc, doc } = window.firebaseFunctions;
    await updateDoc(doc(window.firebaseDb, 'users', currentUser.uid), updates);
}

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

// Authentication functions
function initializeAuth() {
    const { onAuthStateChanged } = window.firebaseFunctions;
    
    onAuthStateChanged(window.firebaseAuth, async (user) => {
        currentUser = user;
        console.log('Auth state changed:', { 
            user: !!user, 
            email: user?.email,
            uid: user?.uid 
        });
        
        if (user) {
            // User is signed in
            console.log('User signed in, loading data...');
            await loadUserData();
            showMainApp();
        } else {
            // User is signed out
            console.log('User signed out');
            showAuthModal();
        }
    });
}

async function loadUserData() {
    if (!currentUser) return;
    
    try {
        const { doc, getDoc } = window.firebaseFunctions;
        const userDoc = await getDoc(doc(window.firebaseDb, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            userSubscription = userData.subscription || 'free';
            userUsageToday = userData.usageToday || 0;
            
            console.log('User data loaded:', {
                subscription: userSubscription,
                usageToday: userUsageToday,
                lastUsageDate: userData.lastUsageDate
            });
            
            // Reset usage if it's a new day
            const lastUsageDate = userData.lastUsageDate;
            const today = new Date().toDateString();
            if (lastUsageDate !== today) {
                userUsageToday = 0;
                await updateUserData({ usageToday: 0, lastUsageDate: today });
            }
        } else {
            // New user
            console.log('Creating new user data');
            await createUserData();
        }
        
        updateUIForUser();
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

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

function updateUIForUser() {
    console.log('updateUIForUser called, userSubscription:', userSubscription);
    
    // Update premium banner
    const banner = document.getElementById('premium-banner');
    if (banner) {
        if (userSubscription === 'free') {
            banner.style.display = 'block';
        } else {
            banner.style.display = 'none';
        }
    }
    
    // Show/hide premium features
    const formatSelection = document.getElementById('format-selection');
    const businessIntelligenceBtn = document.getElementById('business-intelligence');
    const savePlanBtn = document.getElementById('save-plan');
    const viewPortfolioBtn = document.getElementById('view-portfolio');
    
    console.log('Premium elements found:', {
        formatSelection: !!formatSelection,
        businessIntelligenceBtn: !!businessIntelligenceBtn,
        savePlanBtn: !!savePlanBtn,
        viewPortfolioBtn: !!viewPortfolioBtn
    });
    
    if (userSubscription === 'premium' || userSubscription === 'pro' || userSubscription === 'studio' || userSubscription === 'enterprise') {
        console.log('Enabling premium features for tier:', userSubscription);
        // Enable all premium features
        if (formatSelection) {
            formatSelection.style.display = 'block';
            formatSelection.disabled = false;
        }
        if (businessIntelligenceBtn) {
            businessIntelligenceBtn.style.display = 'block';
            businessIntelligenceBtn.disabled = false;
            businessIntelligenceBtn.onclick = generateBusinessIntelligence;
        }
        if (savePlanBtn) {
            savePlanBtn.style.display = 'block';
            savePlanBtn.disabled = false;
            savePlanBtn.onclick = savePlanToPortfolio;
        }
        if (viewPortfolioBtn) {
            viewPortfolioBtn.style.display = 'block';
            viewPortfolioBtn.disabled = false;
            viewPortfolioBtn.onclick = viewPortfolio;
        }
    } else {
        console.log('Showing disabled premium features for free tier');
        // Show but disable premium features with upgrade prompts
        if (formatSelection) {
            formatSelection.style.display = 'block';
            formatSelection.disabled = true;
            formatSelection.title = 'Upgrade to Premium to use this feature';
            formatSelection.onchange = () => {
                alert('📋 Upgrade to Premium to unlock Plan Format Selection!\n\nGet access to:\n• Technical Specification\n• Pitch Deck Format\n• Business Plan\n• Timeline & Milestones\n• Budget Breakdown\n\nOnly £4.99/month');
                upgradeToPro();
            };
        }
        if (businessIntelligenceBtn) {
            businessIntelligenceBtn.style.display = 'block';
            businessIntelligenceBtn.disabled = true;
            businessIntelligenceBtn.title = 'Upgrade to Pro to use Business Intelligence';
            businessIntelligenceBtn.onclick = () => {
                alert('� Upgrade to Pro to unlock Business Intelligence Analysis!\n\nGet access to:\n• Market Research & Analysis\n• Revenue Projections\n• Competitive Landscape\n• Launch Strategy\n• Performance Optimization\n\nOnly £8.99/month');
                upgradeToPro();
            };
        }
        if (savePlanBtn) {
            savePlanBtn.style.display = 'block';
            savePlanBtn.disabled = true;
            savePlanBtn.title = 'Upgrade to Studio to save plans';
            savePlanBtn.onclick = () => {
                alert('📁 Upgrade to Studio to save unlimited plans to your portfolio!\n\nGet access to:\n• Unlimited Plan Saving\n• Portfolio Management\n• Project Organization\n• Progress Tracking\n• Advanced Export Options\n\nOnly £17.99/month');
                upgradeToPro();
            };
        }
        if (viewPortfolioBtn) {
            viewPortfolioBtn.style.display = 'block';
            viewPortfolioBtn.disabled = true;
            viewPortfolioBtn.title = 'Upgrade to Studio to view portfolio';
            viewPortfolioBtn.onclick = () => {
                alert('📁 Upgrade to Studio to manage your portfolio!\n\nGet access to:\n• View Saved Plans\n• Portfolio Dashboard\n• Project History\n• Search & Filter\n• Portfolio Analytics\n\nOnly £17.99/month');
                upgradeToPro();
            };
        }
    }
    
    // Add user account info
    addUserAccountUI();
    
    // Add usage limits for free users
    if (userSubscription === 'free') {
        addUsageLimitUI();
    }
}

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
    
    const container = document.querySelector('.container');
    if (container) {
        container.appendChild(accountDiv);
    }
}

function addUsageLimitUI() {
    const existing = document.querySelector('.usage-limit');
    if (existing) existing.remove();
    
    const remaining = DAILY_LIMIT_FREE - userUsageToday;
    const main = document.querySelector('main');
    if (main) {
        if (remaining <= 0) {
            const limitDiv = document.createElement('div');
            limitDiv.className = 'usage-limit';
            limitDiv.innerHTML = '⚠️ Daily limit reached! <a href="#" onclick="upgradeToPro()">Upgrade to Pro</a> for unlimited plans.';
            main.insertBefore(limitDiv, main.firstChild);
        } else {
            const limitDiv = document.createElement('div');
            limitDiv.className = 'usage-limit';
            limitDiv.innerHTML = `📊 ${remaining} free plans remaining today`;
            main.insertBefore(limitDiv, main.firstChild);
        }
    }
}

function showAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.style.display = 'flex';
    }
    const container = document.querySelector('.container');
    if (container) {
        container.style.display = 'none';
    }
    const banner = document.getElementById('premium-banner');
    if (banner) {
        banner.style.display = 'none';
    }
}

function showMainApp() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.style.display = 'none';
    }
    const container = document.querySelector('.container');
    if (container) {
        container.style.display = 'block';
    }
}

function logoutUser() {
    const { signOut } = window.firebaseFunctions;
    signOut(window.firebaseAuth).then(() => {
        currentUser = null;
        userSubscription = null;
        userUsageToday = 0;
        console.log('User logged out');
        location.reload(); // Refresh to reset UI
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}

// Stripe webhook handler to update subscription after payment
async function handleStripeWebhook() {
    // This would be called by your webhook endpoint
    // For now, let's add a manual subscription check
    if (currentUser) {
        console.log('Checking subscription status...');
        await loadUserData(); // Reload user data to get latest subscription
        updateUIForUser(); // Update UI with new subscription status
    }
}

// Check subscription status periodically
setInterval(async () => {
    if (currentUser) {
        await loadUserData();
        updateUIForUser();
    }
}, 30000); // Check every 30 seconds

// Development testing buttons
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const testDiv = document.createElement('div');
    testDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #333;
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 9999;
        font-size: 12px;
    `;
    testDiv.innerHTML = `
        <div style="margin-bottom: 5px;"><strong>🧪 Dev Testing</strong></div>
        <button onclick="window.testSubscription('free');" style="margin: 2px; padding: 5px; font-size: 11px;">Free</button>
        <button onclick="window.testSubscription('premium');" style="margin: 2px; padding: 5px; font-size: 11px;">Premium</button>
        <button onclick="window.testSubscription('pro');" style="margin: 2px; padding: 5px; font-size: 11px;">Pro</button>
        <button onclick="window.testSubscription('studio');" style="margin: 2px; padding: 5px; font-size: 11px;">Studio</button>
        <button onclick="window.testSubscription('enterprise');" style="margin: 2px; padding: 5px; font-size: 11px;">Enterprise</button>
    `;
    document.body.appendChild(testDiv);
    
    // Make function globally available
    window.testSubscription = function(tier) {
        console.log('Testing subscription tier:', tier);
        userSubscription = tier;
        updateUIForUser();
    };
    
    // Make updateUIForUser globally available for HTML onclick handlers
    window.updateUIForUser = updateUIForUser;
}

function upgradeToPro() {
    if (!currentUser) {
        alert('Please sign in first to upgrade!');
        return;
    }
    
    // Scroll to upgrade button
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (upgradeBtn) {
        upgradeBtn.scrollIntoView({ behavior: 'smooth' });
        upgradeBtn.click();
    }
}

// Auth event handlers (moved inside main DOMContentLoaded)
    // Login form
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                const { signInWithEmailAndPassword } = window.firebaseFunctions;
                await signInWithEmailAndPassword(window.firebaseAuth, email, password);
                const authError = document.getElementById('auth-error');
                if (authError) {
                    authError.style.display = 'none';
                }
            } catch (error) {
                const authError = document.getElementById('auth-error');
                if (authError) {
                    authError.style.display = 'block';
                    authError.textContent = error.message;
                }
            }
        });
    }
    
    // Signup form
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', async () => {
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            
            try {
                const { createUserWithEmailAndPassword } = window.firebaseFunctions;
                await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
                const authError = document.getElementById('auth-error');
                if (authError) {
                    authError.style.display = 'none';
                }
            } catch (error) {
                const authError = document.getElementById('auth-error');
                if (authError) {
                    authError.style.display = 'block';
                    authError.textContent = error.message;
                }
            }
        });
    }
    
    // Form switching
    const showSignupBtn = document.getElementById('show-signup');
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const loginForm = document.getElementById('login-form');
            const signupForm = document.getElementById('signup-form');
            if (loginForm) loginForm.style.display = 'none';
            if (signupForm) signupForm.style.display = 'block';
        });
    }
    
    const showLoginBtn = document.getElementById('show-login');
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const loginForm = document.getElementById('login-form');
            const signupForm = document.getElementById('signup-form');
            if (loginForm) loginForm.style.display = 'block';
            if (signupForm) signupForm.style.display = 'none';
        });
    }
});

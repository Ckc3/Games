
const PROXY_BUILDERS = [

    u => `https://your-proxy-1.example.com/proxy?url=${encodeURIComponent(u)}`,


    u => `https://your-proxy-2.example.com/browse/${encodeURIComponent(u)}`,


    u => `https://your-proxy-3.example.com/service?u=${encodeURIComponent(u)}`
];


function normalizeUrl(url) {
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}


function applyProxyIfEnabled(url) {
    const normalized = normalizeUrl(url);
    const autoProxy = document.getElementById('autoProxy')?.checked;

    if (!autoProxy || !Array.isArray(PROXY_BUILDERS) || PROXY_BUILDERS.length === 0) {
        return normalized;
    }

    const builder = PROXY_BUILDERS[Math.floor(Math.random() * PROXY_BUILDERS.length)];
    try {
        return builder(normalized);
    } catch {

        return normalized;
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {

            navBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            

            btn.classList.add('active');
            

            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    

    setupSearch('games-search', 'games');
    setupSearch('apps-search', 'apps');
    

    setupSettings();
    

    loadSettings();
    

    document.getElementById('gameModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeGame();
        }
    });
    

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeGame();
        }
    });
});


function playGame(title, url) {
    const modal = document.getElementById('gameModal');
    const gameTitle = document.getElementById('gameTitle');
    const gameFrame = document.getElementById('gameFrame');
    
    gameTitle.textContent = title;

    gameFrame.src = applyProxyIfEnabled(url);
    modal.classList.add('active');
    

    document.body.style.overflow = 'hidden';
}


function closeGame() {
    const modal = document.getElementById('gameModal');
    const gameFrame = document.getElementById('gameFrame');
    
    modal.classList.remove('active');
    gameFrame.src = '';
    

    document.body.style.overflow = 'auto';
}


function toggleFullscreen() {
    const gameFrame = document.getElementById('gameFrame');
    
    if (!document.fullscreenElement) {
        gameFrame.requestFullscreen().catch(err => {
            console.log('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}


function setupSearch(searchId, tabId) {
    const searchInput = document.getElementById(searchId);
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const cards = document.querySelectorAll(`#${tabId} .card`);
            
            cards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}


function openApp(url) {
    const finalUrl = applyProxyIfEnabled(url);
    const openMode = getOpenMode();
    if (openMode === 'newTab') {
        window.open(finalUrl, '_blank');
    } else {
        window.location.href = finalUrl;
    }
}


function openUnblocker(url) {
    const finalUrl = applyProxyIfEnabled(url);
    const openMode = getOpenMode();
    if (openMode === 'newTab') {
        window.open(finalUrl, '_blank');
    } else {
        window.location.href = finalUrl;
    }
}


function unblockSite() {
    const urlInput = document.getElementById('url-input');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Please enter a URL to unblock');
        return;
    }
    

    const fullUrl = normalizeUrl(url);
    

    const proxyUrl = applyProxyIfEnabled(fullUrl);
    
    const openMode = getOpenMode();
    if (openMode === 'newTab') {
        window.open(proxyUrl, '_blank');
    } else {
        window.location.href = proxyUrl;
    }
    

    if (document.getElementById('saveHistory').checked) {
        saveToHistory(fullUrl);
    }
    

    urlInput.value = '';
}


function setupSettings() {

    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'light') {
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
            }
            saveSettings();
        });
    });
    

    const openModeRadios = document.querySelectorAll('input[name="openMode"]');
    openModeRadios.forEach(radio => {
        radio.addEventListener('change', saveSettings);
    });
    

    const checkboxes = document.querySelectorAll('#settings input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', saveSettings);
    });
}


function getOpenMode() {
    const openModeRadio = document.querySelector('input[name="openMode"]:checked');
    return openModeRadio ? openModeRadio.value : 'newTab';
}


function saveSettings() {
    const settings = {
        theme: document.querySelector('input[name="theme"]:checked')?.value || 'dark',
        openMode: document.querySelector('input[name="openMode"]:checked')?.value || 'newTab',
        autoProxy: document.getElementById('autoProxy')?.checked || false,
        saveHistory: document.getElementById('saveHistory')?.checked || false
    };
    
    localStorage.setItem('scarSettings', JSON.stringify(settings));
}


function loadSettings() {
    const savedSettings = localStorage.getItem('scarSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        

        if (settings.theme === 'light') {
            document.body.classList.add('light-theme');
            document.querySelector('input[name="theme"][value="light"]').checked = true;
        }
        

        if (settings.openMode) {
            document.querySelector(`input[name="openMode"][value="${settings.openMode}"]`).checked = true;
        }
        

        if (document.getElementById('autoProxy')) {
            document.getElementById('autoProxy').checked = settings.autoProxy;
        }
        if (document.getElementById('saveHistory')) {
            document.getElementById('saveHistory').checked = settings.saveHistory;
        }
    }
}


function saveToHistory(url) {
    let history = JSON.parse(localStorage.getItem('scarHistory') || '[]');
    

    history.unshift({
        url: url,
        timestamp: new Date().toISOString(),
        title: url
    });
    

    history = history.slice(0, 50);
    
    localStorage.setItem('scarHistory', JSON.stringify(history));
}


function clearData() {
    if (confirm('Are you sure you want to clear all data? This will remove your settings and history.')) {
        localStorage.removeItem('scarSettings');
        localStorage.removeItem('scarHistory');
        

        document.querySelector('input[name="theme"][value="dark"]').checked = true;
        document.querySelector('input[name="openMode"][value="newTab"]').checked = true;
        document.getElementById('autoProxy').checked = true;
        document.getElementById('saveHistory').checked = false;
        

        document.body.classList.remove('light-theme');
        
        alert('All data has been cleared successfully!');
    }
}


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


document.addEventListener('click', function(e) {
    if (e.target.classList.contains('play-btn') || e.target.classList.contains('unblock-btn')) {
        const originalText = e.target.textContent;
        e.target.textContent = 'Loading...';
        e.target.disabled = true;
        
        setTimeout(() => {
            e.target.textContent = originalText;
            e.target.disabled = false;
        }, 1000);
    }
});


document.addEventListener('keydown', function(e) {

    if (e.altKey && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        const navBtns = document.querySelectorAll('.nav-btn');
        if (navBtns[tabIndex]) {
            navBtns[tabIndex].click();
        }
    }
    

    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        const activeTab = document.querySelector('.tab-content.active');
        const searchInput = activeTab.querySelector('input[type="text"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
});


const lightThemeStyles = `
.light-theme {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
    color: #333333 !important;
}

.light-theme .header {
    border-bottom-color: rgba(139, 69, 199, 0.2) !important;
}

.light-theme .card {
    background: rgba(255, 255, 255, 0.8) !important;
    color: #333333 !important;
}

.light-theme .card p {
    color: #666666 !important;
}

.light-theme .setting-card {
    background: rgba(255, 255, 255, 0.8) !important;
    color: #333333 !important;
}

.light-theme .search-bar input,
.light-theme .url-input-container input {
    background: rgba(255, 255, 255, 0.9) !important;
    color: #333333 !important;
}

.light-theme .search-bar input::placeholder,
.light-theme .url-input-container input::placeholder {
    color: #999999 !important;
}

.light-theme .footer {
    border-top-color: rgba(139, 69, 199, 0.2) !important;
    color: #666666 !important;
}

.light-theme .game-modal-content {
    background: rgba(245, 247, 250, 0.95) !important;
    color: #333333 !important;
}

.light-theme .game-modal-header {
    background: rgba(139, 69, 199, 0.1) !important;
}
`;


const styleSheet = document.createElement('style');
styleSheet.textContent = lightThemeStyles;
document.head.appendChild(styleSheet);


function openRedditClone() {
    const modal = document.getElementById('redditModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeReddit() {
    const modal = document.getElementById('redditModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function toggleRedditFullscreen() {
    const modal = document.getElementById('redditModal');
    
    if (!document.fullscreenElement) {
        modal.requestFullscreen().catch(err => {
            console.log('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

async function searchReddit() {
    const searchInput = document.getElementById('reddit-search-input');
    const searchType = document.getElementById('search-type');
    const postsContainer = document.getElementById('reddit-posts');
    
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    postsContainer.innerHTML = '<div class="loading">Loading posts...</div>';
    
    try {
        let url;
        if (searchType.value === 'subreddit') {
            url = `https://www.reddit.com/r/${query}.json?limit=25`;
        } else {
            url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=25`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.data && data.data.children && data.data.children.length > 0) {
            displayRedditPosts(data.data.children);
        } else {
            postsContainer.innerHTML = '<div class="no-results">No posts found. Try a different search term.</div>';
        }
    } catch (error) {
        console.error('Error fetching Reddit data:', error);
        postsContainer.innerHTML = '<div class="error">Error loading posts. Please try again.</div>';
    }
}

function displayRedditPosts(posts) {
    const postsContainer = document.getElementById('reddit-posts');
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postData = post.data;
        const postElement = createPostElement(postData);
        postsContainer.appendChild(postElement);
    });
}

function createPostElement(postData) {
    const postDiv = document.createElement('div');
    postDiv.className = 'reddit-post';
    

    const timeAgo = getTimeAgo(postData.created_utc);
    

    let mediaContent = '';
    if (postData.post_hint === 'image' || (postData.url && isImageUrl(postData.url))) {
        mediaContent = `
            <div class="post-media">
                <img src="${postData.url}" alt="Post image" loading="lazy" onerror="this.style.display='none'">
            </div>
        `;
    } else if (postData.is_video && postData.media && postData.media.reddit_video) {
        mediaContent = `
            <div class="post-media">
                <video controls>
                    <source src="${postData.media.reddit_video.fallback_url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    } else if (postData.url && !postData.url.includes('reddit.com')) {
        mediaContent = `
            <div class="post-link">
                <a href="${postData.url}" target="_blank" rel="noopener noreferrer">
                    🔗 ${postData.url}
                </a>
            </div>
        `;
    }
    
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-subreddit">r/${postData.subreddit}</div>
            <div class="post-author">u/${postData.author}</div>
            <div class="post-time">${timeAgo}</div>
        </div>
        <div class="post-title" onclick="openPostDetail('${postData.id}')">${escapeHtml(postData.title)}</div>
        ${mediaContent}
        <div class="post-content">${escapeHtml(postData.selftext || '').substring(0, 300)}${postData.selftext && postData.selftext.length > 300 ? '...' : ''}</div>
        <div class="post-footer">
            <div class="post-stats">
                <span class="upvotes">↑ ${formatNumber(postData.ups)}</span>
                <span class="comments" onclick="openPostDetail('${postData.id}')">${formatNumber(postData.num_comments)} comments</span>
            </div>
            <div class="post-actions">
                <button onclick="openPostDetail('${postData.id}')" class="view-post-btn">View Post</button>
            </div>
        </div>
    `;
    
    return postDiv;
}

async function openPostDetail(postId) {
    const modal = document.getElementById('redditPostModal');
    const container = document.getElementById('post-detail-container');
    
    modal.classList.add('active');
    container.innerHTML = '<div class="loading">Loading post details...</div>';
    
    try {

        const response = await fetch(`https://www.reddit.com/comments/${postId}.json`);
        const data = await response.json();
        
        if (data && data.length > 0 && data[0].data.children.length > 0) {
            const postData = data[0].data.children[0].data;
            const comments = data[1] ? data[1].data.children : [];
            displayPostDetail(postData, comments);
        } else {
            container.innerHTML = '<div class="error">Could not load post details.</div>';
        }
    } catch (error) {
        console.error('Error fetching post details:', error);
        container.innerHTML = '<div class="error">Error loading post details. Please try again.</div>';
    }
}

function displayPostDetail(postData, comments) {
    const container = document.getElementById('post-detail-container');
    

    const timeAgo = getTimeAgo(postData.created_utc);
    

    let mediaContent = '';
    if (postData.post_hint === 'image' || (postData.url && isImageUrl(postData.url))) {
        mediaContent = `
            <div class="post-detail-media">
                <img src="${postData.url}" alt="Post image" loading="lazy">
            </div>
        `;
    } else if (postData.is_video && postData.media && postData.media.reddit_video) {
        mediaContent = `
            <div class="post-detail-media">
                <video controls>
                    <source src="${postData.media.reddit_video.fallback_url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    } else if (postData.url && !postData.url.includes('reddit.com')) {
        mediaContent = `
            <div class="post-detail-link">
                <a href="${postData.url}" target="_blank" rel="noopener noreferrer">
                    🔗 View Original Link
                </a>
            </div>
        `;
    }
    

    let commentsHtml = '';
    if (comments && comments.length > 0) {
        commentsHtml = '<div class="comments-section"><h3>Comments</h3>';
        comments.forEach(comment => {
            if (comment.data && comment.data.body) {
                const commentTimeAgo = getTimeAgo(comment.data.created_utc);
                commentsHtml += `
                    <div class="comment">
                        <div class="comment-header">
                            <span class="comment-author">u/${comment.data.author}</span>
                            <span class="comment-time">${commentTimeAgo}</span>
                            <span class="comment-score">↑ ${formatNumber(comment.data.ups)}</span>
                        </div>
                        <div class="comment-body">${escapeHtml(comment.data.body)}</div>
                    </div>
                `;
            }
        });
        commentsHtml += '</div>';
    }
    
    container.innerHTML = `
        <div class="post-detail">
            <div class="post-detail-header">
                <div class="post-detail-subreddit">r/${postData.subreddit}</div>
                <div class="post-detail-author">u/${postData.author}</div>
                <div class="post-detail-time">${timeAgo}</div>
            </div>
            <h2 class="post-detail-title">${escapeHtml(postData.title)}</h2>
            ${mediaContent}
            <div class="post-detail-content">${escapeHtml(postData.selftext || '')}</div>
            <div class="post-detail-stats">
                <span class="upvotes">↑ ${formatNumber(postData.ups)}</span>
                <span class="comments">${formatNumber(postData.num_comments)} comments</span>
            </div>
            ${commentsHtml}
        </div>
    `;
}

function closePostDetail() {
    const modal = document.getElementById('redditPostModal');
    modal.classList.remove('active');
}

function togglePostDetailFullscreen() {
    const modal = document.getElementById('redditPostModal');
    
    if (!document.fullscreenElement) {
        modal.requestFullscreen().catch(err => {
            console.log('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}


function getTimeAgo(timestamp) {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isImageUrl(url) {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}


document.getElementById('redditModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeReddit();
    }
});


(function () {
  function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, stars, starCount;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      starCount = Math.min(220, Math.floor((width * height) / 12000));
      stars = Array.from({ length: starCount }, createStar);
    }

    function createStar() {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.15; 
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 0.5 + Math.random() * 1.2,          
        alpha: 0.6 + Math.random() * 0.4       
      };
    }

    function drawStar(s) {

        const glowRadius = s.r * 4;
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowRadius);
      grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    function step() {

        ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;


        if (s.x < -5) s.x = width + 5;
        if (s.x > width + 5) s.x = -5;
        if (s.y < -5) s.y = height + 5;
        if (s.y > height + 5) s.y = -5;

        drawStar(s);
      }

      requestAnimationFrame(step);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(step);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStarfield);
  } else {
    initStarfield();
  }
})();


document.getElementById('redditPostModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closePostDetail();
    }
});


document.getElementById('reddit-search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchReddit();
    }
});

const axios = require('axios');
const moment = require("moment-timezone");
const { zokou } = require(__dirname + "/../framework/zokou");

// Configuration - Easily modifiable constants
const CONFIG = {
    CHANNEL_JID: "https://whatsapp.com/channel/0029Vao2hgeChq6HJ5bmlZ3K",
    REPO_OWNER: "romanuzkenya",
    REPO_NAME: "kijana-mdogo",
    COMMANDS: ["github", "repo", "script", "sc"],
    TIMEZONE: "Africa/Nairobi", // Example timezone
    TIME_FORMAT: "DD/MM/YYYY HH:mm:ss"
};

// Utility functions
const formatNumber = (num) => num.toLocaleString();

const fetchGitHubRepoDetails = async () => {
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${CONFIG.romanuzkenya}/${CONFIG.kijanamdogo}`,
            {
                headers: {
                    'User-Agent': 'Charles-XMD-Bot/1.0',
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        const { 
            name, 
            description, 
            forks_count, 
            stargazers_count, 
            watchers_count, 
            open_issues_count, 
            owner, 
            license,
            html_url,
            created_at,
            updated_at,
            size,
            default_branch
        } = response.data;

        return {
            name,
            description: description || "No description provided",
            forks: forks_count,
            stars: stargazers_count,
            watchers: watchers_count,
            issues: open_issues_count,
            owner: owner.login,
            license: license ? license.name : "No license",
            url: html_url,
            createdAt: created_at,
            updatedAt: updated_at,
            size: Math.round(size / 1024), // Convert to KB
            defaultBranch: default_branch
        };
    } catch (error) {
        console.error("GitHub API Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch repository data from GitHub");
    }
};

const generateRepoInfoMessage = (repoDetails) => {
    const currentTime = moment().tz(CONFIG.TIMEZONE).format(CONFIG.TIME_FORMAT);
    
    return `
🌟 *${repoDetails.name}* - GitHub Repository Information 🌟

📝 *Description:* ${repoDetails.description}
👨‍💻 *Owner:* ${repoDetails.owner}
🌿 *Default Branch:* ${repoDetails.defaultBranch}
📜 *License:* ${repoDetails.license}

📊 *Statistics:*
⭐ *Stars:* ${formatNumber(repoDetails.stars)}
🍴 *Forks:* ${formatNumber(repoDetails.forks)}
👀 *Watchers:* ${formatNumber(repoDetails.watchers)}
❗ *Open Issues:* ${formatNumber(repoDetails.issues)}
🗃️ *Repository Size:* ${repoDetails.size} KB

⏳ *Created:* ${moment(repoDetails.createdAt).format(CONFIG.TIME_FORMAT)}
🔄 *Last Updated:* ${moment(repoDetails.updatedAt).format(CONFIG.TIME_FORMAT)}

📢 *Official Channel:* ${CONFIG.CHANNEL_JID}
📅 *Info Fetched:* ${currentTime}

🔗 *Repository URL:*
${repoDetails.url}
    `.trim();
};

// Register commands
CONFIG.COMMANDS.forEach((command) => {
    zokou({ 
        nomCom: command, 
        categorie: "GitHub",
        reaction: "💻" 
    }, async (dest, zk, commandeOptions) => {
        const { repondre } = commandeOptions || {};
        const loadingMsg = await (repondre || zk.sendMessage)(dest, { 
            text: "⏳ Fetching repository information from GitHub..." 
        });

        try {
            const repoDetails = await fetchGitHubRepoDetails();
            
            await zk.sendMessage(dest, {
                text: `🛠️ *${repoDetails.name}* - Developed by *Charleske ke*`
            });

            await zk.sendMessage(dest, { 
                text: generateRepoInfoMessage(repoDetails) 
            });

            // Delete loading message if possible
            if (loadingMsg && loadingMsg.key) {
                await zk.sendMessage(dest, {
                    delete: loadingMsg.key
                }).catch(e => console.log("Couldn't delete loading message"));
            }
        } catch (error) {
            console.error("Command Error:", error);
            await (repondre || zk.sendMessage)(dest, { 
                text: `❌ Error: ${error.message}\n\nPlease try again later.` 
            });
        }
    });
});

console.log(`✅ GitHub repository commands loaded: ${CONFIG.COMMANDS.join(", ")}`);

const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

async function fetchGitHubProfile(username, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data: user } = await axios.get(`${GITHUB_API}/users/${username}`, { headers });
  const { data: repos } = await axios.get(`${GITHUB_API}/users/${username}/repos?per_page=100`, { headers });

  const languages = {};
  let readmeText = '';

  for (const repo of repos.slice(0, 10)) {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
    readmeText += `${repo.name} ${repo.description || ''} ${repo.language || ''} `;
  }

  return {
    profile: {
      username: user.login,
      name: user.name,
      bio: user.bio,
      publicRepos: user.public_repos,
      followers: user.followers,
    },
    repos: repos.map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
    })),
    languages,
    signals: { readmeText, repoCount: repos.length },
  };
}

module.exports = { fetchGitHubProfile };

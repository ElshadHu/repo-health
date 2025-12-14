import { Octokit } from "@octokit/rest";

// I use env variable for the token to stay secure
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

//getRepoInfo
export const githubService = {
  async getRepoInfo(owner: string, repo: string) {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });
    return {
      name: data.name,
      owner: data.owner.login,
      description: data.description,
      url: data.html_url,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      openIssues: data.open_issues_count,
    };
  },

  async getCommits(owner: string, repo: string) {
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() - 90);
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      since: ninetyDays.toISOString(),
      per_page: 100,
      page: 1,
    });
    return data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name ?? "Unknown",
      date: commit.commit.author?.date ?? new Date().toISOString(),
      url: commit.html_url,
    }));
  },

  // Get contributors
  async getContributors(owner: string, repo: string) {
    const { data } = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 20,
    });
    return data.map((contributor) => ({
      username: contributor.login,
      avatarUrl: contributor.avatar_url,
      contributions: contributor.contributions,
      url: contributor.html_url,
    }));
  },

  // get stack , get languages

  async getLanguages(owner: string, repo: string) {
    const { data } = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    });

    return data;
  },
};

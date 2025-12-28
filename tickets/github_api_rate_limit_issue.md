# Ticket: GitHub API Rate Limiting and Scraper Responsiveness

## Problem
When scraping GitHub repositories for benchmark data, the scraper frequently encounters API rate limits, even when using a personal access token. This results in long backoff periods, slow scraping, and sometimes incomplete data collection. The lack of detailed API understanding and planning leads to inefficient scraping workflows.

## Details
- GitHub's API has strict rate limits for both search and content endpoints, even for authenticated users.
- The scraper may hang or pause for long periods due to exponential backoff when rate limits are hit.
- Real-time feedback and progress reporting are critical for diagnosing and improving scraper performance.
- This is a recurring issue for any large-scale scraping effort against public APIs.

## Recommendations
- Always review and document API rate limits, quotas, and best practices before building a scraper.
- Implement robust rate limit handling, including backoff, retries, and pacing.
- Limit the number of requests per run and provide clear user feedback.
- Consider batching, caching, or parallelizing with multiple tokens if allowed.
- Update developer onboarding and documentation to emphasize API-first planning.

## Status
- Workarounds in place (pausing, limiting repos, backoff), but a more API-aware approach is needed for scale.

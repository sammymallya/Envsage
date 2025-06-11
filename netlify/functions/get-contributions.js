import fetch from 'node-fetch'; // For making HTTP requests in Node.js

exports.handler = async function(event, context) {
    // Get GitHub username from the query parameters (e.g., ?username=sammymallya)
    const githubUsername = event.queryStringParameters.username;

    if (!githubUsername) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'GitHub username is required.' }),
        };
    }

    // IMPORTANT: Access your GitHub PAT securely from Netlify Environment Variables
    // You will set this in Netlify UI, NOT hardcode it here.
    const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

    // GitHub API endpoint for user profile (to get total contributions)
    // Note: The public API for contributions is not super straightforward for total.
    // A common workaround is to use the GraphQL API.
    // For simplicity, we'll use a public API to fetch user info which might contain total contributions.
    // A more robust solution might need a more complex GraphQL query to ensure the 'total contributions'
    // across all repos are captured as precisely as GitHub's own profile shows.
    const apiUrl = `https://api.github.com/users/${githubUsername}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                // Using the token for higher rate limits, even for public data.
                // This is for demonstration. For truly public data, token might not be strictly needed for users API,
                // but is good for rate limits and typically required for deep contribution data.
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json' // Recommended API version
            }
        });

        if (!response.ok) {
            // If GitHub API returns an error
            const errorData = await response.json();
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `GitHub API Error: ${errorData.message || response.statusText}` }),
            };
        }

        const data = await response.json();

        // The public 'users' API does NOT directly give total contributions like the heatmap.
        // For the exact "total contributions" (like on the heatmap), you usually need
        // GitHub's GraphQL API. That's a more advanced setup.
        // For simplicity here, we'll just return some user info that might be available.
        // If you need the exact number from the heatmap, consider scraping it (fragile)
        // or setting up a more complex GraphQL query in your Netlify function.
        // As a placeholder, we'll return a simple success.
        // For a precise count, fetching from the 'ghchart.rshah.org' image URL itself (which would be complex)
        // or using GraphQL is the way.

        // To get a *real* contributions count, you'd typically use GraphQL:
        /*
        const graphqlQuery = `
        query {
          user(login: "${githubUsername}") {
            contributionsCollection {
              contributionCalendar {
                totalContributions
              }
            }
          }
        }
        `;
        const graphqlResponse = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: graphqlQuery })
        });
        const graphqlData = await graphqlResponse.json();
        const totalContributions = graphqlData?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions || 0;
        */

        // For now, let's just return a placeholder or something simple from the REST API
        // Or, if you specifically want the count from 'ghchart.rshah.org', that's not easily
        // extracted from the SVG image itself without complex parsing.
        // Let's assume you want a rough "total repos" or similar as a fallback.
        // Or, for the *exact* count from the heatmap, the simplest is to manually update
        // if an API isn't easy, or use the GraphQL setup commented above.

        // Given your request for "total contributions number," the GraphQL API is needed.
        // Let's implement that properly in the Netlify function.

        const graphqlQuery = `
        query {
          user(login: "${githubUsername}") {
            contributionsCollection {
              contributionCalendar {
                totalContributions
              }
            }
          }
        }
        `;

        const graphqlResponse = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${githubToken}`, // Use 'bearer' for GraphQL
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: graphqlQuery })
        });

        if (!graphqlResponse.ok) {
            const errorGraphql = await graphqlResponse.json();
            console.error("GraphQL Error:", errorGraphql);
             return {
                statusCode: graphqlResponse.status,
                body: JSON.stringify({ error: `GitHub GraphQL API Error: ${errorGraphql.errors ? errorGraphql.errors.map(e => e.message).join(', ') : graphqlResponse.statusText}` }),
            };
        }

        const graphqlData = await graphqlResponse.json();
        const totalContributions = graphqlData?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions || 0;


        return {
            statusCode: 200,
            body: JSON.stringify({ totalContributions: totalContributions }),
            headers: {
                // Allow requests from your frontend
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch contributions', details: error.message }),
        };
    }
};
import fetch from 'node-fetch';
// No need to import fetch in Node 18+ on Netlify

export async function handler(event, context) {
    const githubUsername = event.queryStringParameters.username;

    if (!githubUsername) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'GitHub username is required.' }),
        };
    }

    const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

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

    try {
        const graphqlResponse = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: graphqlQuery })
        });

        if (!graphqlResponse.ok) {
            const errorGraphql = await graphqlResponse.json();
            return {
                statusCode: graphqlResponse.status,
                body: JSON.stringify({ error: `GitHub GraphQL API Error: ${errorGraphql.errors ? errorGraphql.errors.map(e => e.message).join(', ') : graphqlResponse.statusText}` }),
            };
        }

        const graphqlData = await graphqlResponse.json();
        const totalContributions = graphqlData?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions;
        return {
            statusCode: 200,
            body: JSON.stringify({ totalContributions }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
        };
    }
}
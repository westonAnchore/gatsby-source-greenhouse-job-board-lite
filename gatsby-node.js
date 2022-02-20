const axios = require('axios');
const baseUrl = `https://boards-api.greenhouse.io/v1/boards`;

const getJobs = (url) =>
    axios
    .get(url)
    .then(response => response.data.jobs)
    .then(jobs => {
        return Promise.all(
        jobs.map(async job => {
            const node = await getJob(`${url}${job.id}?questions=true`)
            return node
        })
        )
    })
    .catch(error => console.log(error));

const getJob = (url) =>
    axios
    .get(url)
    .then(response => response.data)
    .then(data => {
        return data
    })
    .catch(error => console.log(error));

async function fetchJobs(boardToken) {
    const url = `${baseUrl}/${boardToken}/jobs/`
    const jobs = await getJobs(url)
    return jobs
}

 exports.sourceNodes = async ({
    actions,
    createContentDigest,
    createNodeId,
  }, pluginOptions) => {
    const { createNode } = actions;
    const { boardToken } = pluginOptions;

    let jobs

    try {
        jobs = await fetchJobs(boardToken)

    } catch (error) {
        log(`
            Error: Fetching data from Greenhouse failed
        `)
        process.exit(1)
    }

    jobs.forEach(job =>
        createNode({
            ...job,
            id: createNodeId(`job-${job.id}`),
            parent: null,
            children: [],
            internal: {
                type: 'jobs',
                content: JSON.stringify(job),
                contentDigest: createContentDigest(job),
            },
        })
    )
}

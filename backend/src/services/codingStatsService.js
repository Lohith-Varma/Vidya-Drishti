const axios = require('axios')
const NodeCache = require('node-cache')

const cache = new NodeCache({ stdTTL: Number(process.env.CACHE_TTL) || 3600 })

// ─── LANGUAGE IDs for Judge0 CE ───────────────────────────
const LANGUAGE_IDS = {
  python:     71,  // Python 3
  cpp:        54,  // C++ (GCC 9.2.0)
  java:       62,  // Java (OpenJDK 13)
  javascript: 63,  // JavaScript (Node.js 12)
  c:          50,  // C (GCC 9.2.0)
  typescript: 74,  // TypeScript
  go:         60,  // Go
  rust:       73,  // Rust
}

// ─── CODE EXECUTION via Judge0 ───────────────────────────
const executeCode = async ({ code, language, testCases = [] }) => {
  const langId = LANGUAGE_IDS[language?.toLowerCase()]
  if (!langId) throw new Error(`Unsupported language: ${language}`)

  // If no JUDGE0 key, use mock execution
  if (!process.env.JUDGE0_API_KEY || process.env.JUDGE0_API_KEY === 'your_judge0_rapidapi_key') {
    return mockExecution(code, language, testCases)
  }

  const results = []
  const stdout_all = []

  for (const tc of testCases) {
    try {
      // Submit to Judge0
      const submitRes = await axios.post(
        `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: code,
          language_id: langId,
          stdin: tc.input || '',
          expected_output: tc.output || null,
          cpu_time_limit: 2,
          memory_limit: 262144, // 256MB in KB
        },
        {
          headers: {
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json',
          }
        }
      )

      const { status, stdout, stderr, compile_output, time, memory } = submitRes.data
      const statusId = status?.id

      if (stdout) stdout_all.push(stdout)

      // Status IDs: 3=AC, 4=WA, 5=TLE, 6=CE, 11=RE
      const verdictMap = { 3: 'AC', 4: 'WA', 5: 'TLE', 6: 'CE', 11: 'RE' }
      const verdict = verdictMap[statusId] || 'RE'
      const passed  = statusId === 3

      results.push({
        passed,
        verdict,
        input:    tc.input,
        expected: tc.output,
        actual:   stdout?.trim() || compile_output?.trim() || stderr?.trim() || '',
        time:     parseFloat(time) * 1000 || null, // convert to ms
        hidden:   tc.hidden || false,
        error:    compile_output || stderr || null,
      })
    } catch (err) {
      results.push({
        passed: false, verdict: 'RE',
        input: tc.input, expected: tc.output, actual: '',
        error: err.message, hidden: tc.hidden || false,
      })
    }
  }

  return { results, stdout: stdout_all.join('\n') }
}

// ─── MOCK EXECUTION (when no Judge0 key) ──────────────────
const mockExecution = (code, language, testCases) => {
  // Very basic simulation — always "passes" for demo purposes
  const results = testCases.map(tc => ({
    passed: Math.random() > 0.3, // 70% pass rate for demo
    verdict: Math.random() > 0.3 ? 'AC' : 'WA',
    input: tc.input,
    expected: tc.output,
    actual: tc.output, // pretend it's correct
    time: Math.floor(Math.random() * 200) + 50,
    hidden: tc.hidden || false,
  }))
  return { results, stdout: `[Mock] Executed ${language} code.\n` }
}

// ─── LEETCODE STATS ───────────────────────────────────────
const getLeetCodeStats = async (username) => {
  const cacheKey = `lc_${username}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const GRAPHQL_URL = process.env.LEETCODE_GRAPHQL_URL || 'https://leetcode.com/graphql'

  // Combined query for profile + submission stats + contest
  const query = `
    query getUserData($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          reputation
        }
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        userCalendar {
          streak
          totalActiveDays
        }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
        attendedContestsCount
        topPercentage
      }
    }
  `

  try {
    const res = await axios.post(
      GRAPHQL_URL,
      { query, variables: { username } },
      {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0',
        },
        timeout: 10000,
      }
    )

    const data = res.data?.data
    const user = data?.matchedUser
    if (!user) throw new Error('LeetCode user not found')

    const acStats = user.submitStats?.acSubmissionNum || []
    const totalStats = user.submitStats?.totalSubmissionNum || []

    const getCount = (arr, diff) => arr.find(a => a.difficulty === diff)?.count || 0
    const getTotal = (arr, diff) => arr.find(a => a.difficulty === diff)?.count || 1

    const totalSolved  = getCount(acStats, 'All')
    const easySolved   = getCount(acStats, 'Easy')
    const mediumSolved = getCount(acStats, 'Medium')
    const hardSolved   = getCount(acStats, 'Hard')
    const easyTotal    = getTotal(totalStats, 'Easy')
    const mediumTotal  = getTotal(totalStats, 'Medium')
    const hardTotal    = getTotal(totalStats, 'Hard')

    const totalSubmissions = getCount(totalStats, 'All')
    const acceptanceRate = totalSubmissions > 0
      ? Math.round((totalSolved / totalSubmissions) * 100)
      : 0

    const stats = {
      username,
      totalSolved, easySolved, mediumSolved, hardSolved,
      easyTotal, mediumTotal, hardTotal,
      acceptanceRate,
      ranking:       user.profile?.ranking || null,
      streak:        user.userCalendar?.streak || 0,
      totalActiveDays: user.userCalendar?.totalActiveDays || 0,
      contestRating: data?.userContestRanking?.rating
        ? Math.round(data.userContestRanking.rating)
        : null,
      contestGlobalRank: data?.userContestRanking?.globalRanking || null,
      contestsAttended:  data?.userContestRanking?.attendedContestsCount || 0,
    }

    cache.set(cacheKey, stats)
    return stats
  } catch (error) {
    throw new Error(`LeetCode fetch failed for ${username}: ${error.message}`)
  }
}

// ─── HACKERRANK STATS ─────────────────────────────────────
const getHackerRankStats = async (username) => {
  const cacheKey = `hr_${username}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  try {
    const [profileRes, badgesRes] = await Promise.allSettled([
      axios.get(`${process.env.HACKERRANK_API_URL}/hackers/${username}/scores_elo`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 8000,
      }),
      axios.get(`https://www.hackerrank.com/rest/hackers/${username}/badges`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 8000,
      })
    ])

    const profileData = profileRes.status === 'fulfilled' ? profileRes.value.data : {}
    const badgesData  = badgesRes.status === 'fulfilled' ? badgesRes.value.data : {}

    const badges = (badgesData.models || []).map(b => ({
      name: b.badge_name,
      stars: b.stars,
      type: b.stars >= 4 ? 'gold' : b.stars >= 2 ? 'silver' : 'bronze',
    }))

    const stats = {
      username,
      rank:          profileData?.rank || null,
      score:         profileData?.current_score || 0,
      solved:        profileData?.solved_challenges || 0,
      certifications: (badgesData.certifications || []).length,
      badges,
    }

    cache.set(cacheKey, stats)
    return stats
  } catch (error) {
    throw new Error(`HackerRank fetch failed for ${username}: ${error.message}`)
  }
}

// ─── SYNC USER CODING STATS to DB ─────────────────────────
const syncUserCodingStats = async (userId, prisma) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeHandle: true, hackerrankHandle: true }
  })

  const updates = {}

  if (user.leetcodeHandle) {
    try {
      const lcStats = await getLeetCodeStats(user.leetcodeHandle)
      Object.assign(updates, {
        totalSolved:   lcStats.totalSolved,
        easySolved:    lcStats.easySolved,
        mediumSolved:  lcStats.mediumSolved,
        hardSolved:    lcStats.hardSolved,
        leetcodeRank:  lcStats.ranking,
        contestRating: lcStats.contestRating,
        streak:        lcStats.streak,
      })
    } catch (err) {
      console.warn(`LeetCode sync failed for user ${userId}: ${err.message}`)
    }
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({ where: { id: userId }, data: updates })
  }

  return updates
}

module.exports = { executeCode, getLeetCodeStats, getHackerRankStats, syncUserCodingStats }

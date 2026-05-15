const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Candidate = require('../models/Candidate');

// POST /api/ai/shortlist - AI-powered candidate shortlisting
router.post('/shortlist', async (req, res) => {
  try {
    const { requiredSkills, minExperience, preferredSkills } = req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'requiredSkills array is required'
      });
    }

    const candidates = await Candidate.find({});

    if (candidates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No candidates in database to analyze'
      });
    }

    // Build candidate list for the prompt
    const candidateList = candidates.map((c, i) =>
      `${i + 1}. ${c.name} (${c.email}) - Skills: ${c.skills.join(', ')} - Experience: ${c.experience} year(s)${c.bio ? ` - Bio: ${c.bio}` : ''}`
    ).join('\n');

    const prompt = `You are an expert technical recruiter AI. Analyze the following candidates for a job position and rank them from best fit to worst fit.

Job Requirements:
- Required Skills: ${requiredSkills.join(', ')}
- Minimum Experience: ${minExperience || 0} year(s)
${preferredSkills && preferredSkills.length > 0 ? `- Preferred Skills: ${preferredSkills.join(', ')}` : ''}

Candidates:
${candidateList}

For each candidate, provide:
1. A ranking position (1 = best fit)
2. A match percentage (0-100%)
3. A brief explanation of why they are or aren't a good fit
4. Any strengths or concerns

Format your response as a JSON array (and nothing else) with objects having these fields:
- "name": candidate name
- "email": candidate email
- "rank": number (1 = best)
- "matchPercentage": number (0-100)
- "recommendation": "Highly Recommended" | "Recommended" | "Consider" | "Not Recommended"
- "explanation": string explaining the ranking
- "strengths": array of strength strings
- "concerns": array of concern strings

Return ONLY valid JSON, no markdown formatting or code blocks.`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o';

    if (!apiKey || apiKey.includes('your-openrouter')) {
      return res.status(500).json({
        success: false,
        message: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.'
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Candidate Shortlisting System'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical recruiter AI. You always respond with valid JSON arrays only, no markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      return res.status(502).json({
        success: false,
        message: 'OpenRouter API error',
        detail: errorData
      });
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || '[]';

    // Try to parse the AI response
    let aiResults;
    try {
      // Clean up potential markdown code block wrapping
      let cleaned = aiContent.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      aiResults = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', aiContent);
      return res.json({
        success: true,
        parsed: false,
        rawResponse: aiContent,
        data: []
      });
    }

    res.json({
      success: true,
      parsed: true,
      model: model,
      data: aiResults
    });
  } catch (err) {
    console.error('AI shortlist error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/interview-questions - Generate interview questions
router.post('/interview-questions', async (req, res) => {
  try {
    const { candidateName, skills, experience, role } = req.body;

    const prompt = `Generate 5 technical interview questions for a candidate named ${candidateName} who has ${experience} years of experience with skills in ${skills.join(', ')}${role ? ` applying for the role of ${role}` : ''}.

For each question, provide:
1. The question text
2. What skill/competency it tests
3. What a good answer would cover (brief)

Format as a JSON array with objects having: "question", "testsSkill", "expectedAnswer"
Return ONLY valid JSON, no markdown.`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o';

    if (!apiKey || apiKey.includes('your-openrouter')) {
      return res.status(500).json({
        success: false,
        message: 'OpenRouter API key not configured.'
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Candidate Shortlisting System'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical interviewer. Respond with valid JSON arrays only.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(502).json({ success: false, message: 'OpenRouter API error', detail: errorData });
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || '[]';

    let questions;
    try {
      let cleaned = aiContent.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      questions = JSON.parse(cleaned);
    } catch {
      return res.json({ success: true, parsed: false, rawResponse: aiContent, data: [] });
    }

    res.json({ success: true, parsed: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// POST /api/match - Basic algorithmic shortlisting
router.post('/', async (req, res) => {
  try {
    const { requiredSkills, minExperience, preferredSkills } = req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'requiredSkills array is required'
      });
    }

    const candidates = await Candidate.find({});

    // Normalize required skills for case-insensitive matching
    const reqSkillsLower = requiredSkills.map(s => s.toLowerCase().trim());
    const prefSkillsLower = (preferredSkills || []).map(s => s.toLowerCase().trim());
    const minExp = minExperience || 0;

    const results = candidates.map(candidate => {
      const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase().trim());

      // Required skill matching
      const matchedRequired = reqSkillsLower.filter(skill =>
        candidateSkillsLower.includes(skill)
      );
      const requiredScore = matchedRequired.length / reqSkillsLower.length;

      // Preferred skill matching (bonus)
      let preferredScore = 0;
      let matchedPreferred = [];
      if (prefSkillsLower.length > 0) {
        matchedPreferred = prefSkillsLower.filter(skill =>
          candidateSkillsLower.includes(skill)
        );
        preferredScore = matchedPreferred.length / prefSkillsLower.length;
      }

      // Experience check
      const meetsExperience = candidate.experience >= minExp;
      const experienceBonus = meetsExperience ? 0.1 : -0.15;

      // Composite score: 70% required, 20% preferred, 10% experience
      const compositeScore = Math.min(1, Math.max(0,
        (requiredScore * 0.7) + (preferredScore * 0.2) + (meetsExperience ? 0.1 : 0)
      ));

      // Match level
      let matchLevel;
      if (compositeScore >= 0.7) matchLevel = 'High';
      else if (compositeScore >= 0.4) matchLevel = 'Medium';
      else matchLevel = 'Low';

      return {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        skills: candidate.skills,
        experience: candidate.experience,
        bio: candidate.bio,
        matchScore: Math.round(compositeScore * 100),
        matchedSkills: matchedRequired.map(s =>
          requiredSkills.find(rs => rs.toLowerCase() === s) || s
        ),
        matchedPreferred: matchedPreferred.map(s =>
          (preferredSkills || []).find(ps => ps.toLowerCase() === s) || s
        ),
        meetsExperience,
        matchLevel
      };
    });

    // Sort by match score descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      totalCandidates: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
